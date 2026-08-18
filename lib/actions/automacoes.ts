"use server";

import { revalidatePath } from "next/cache";

import {
  computeEligiblePatients,
  computeEligibleStockItems,
  mapAutomationRule,
  resolveMessageTemplateFull,
  type AutomationAction,
  type AutomationCondition,
  type AutomationRule,
  type AutomationTrigger,
} from "@/lib/automacao-types";
import type { AutomationStatus } from "@/lib/automacao-status";
import { getCurrentUser } from "@/lib/auth";
import { mapStockItem } from "@/lib/estoque-types";
import { Prisma } from "@/lib/generated/prisma/client";
import { computeBudgetTotals } from "@/lib/orcamentos-types";
import { mapPatient } from "@/lib/patient-types";
import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";

export type AutomacoesActionState<T = undefined> = {
  error?: string;
  data?: T;
};

async function requireAutomacoesManager() {
  const currentUser = await getCurrentUser();
  if (!currentUser || !["recepcionista", "gestor"].includes(currentUser.role)) {
    return null;
  }
  return currentUser;
}

type AutomationRuleInput = {
  name: string;
  description?: string;
  trigger: AutomationTrigger;
  condition: AutomationCondition | null;
  action: AutomationAction;
  status: AutomationStatus;
  targetPatientIds?: string[];
};

export async function createAutomationRule(
  input: AutomationRuleInput,
): Promise<AutomacoesActionState<AutomationRule>> {
  const currentUser = await requireAutomacoesManager();
  if (!currentUser) return { error: "Você não tem permissão para criar regras de automação." };
  if (!input.name.trim()) return { error: "Preencha o nome da regra." };

  const row = await prisma.automationRule.create({
    data: {
      clinicId: currentUser.clinicId,
      name: input.name.trim(),
      description: input.description || undefined,
      trigger: input.trigger,
      condition: input.condition ?? undefined,
      action: input.action,
      status: input.status,
      targetPatientIds: input.targetPatientIds ?? [],
    },
  });

  revalidatePath("/automacoes");
  return { data: mapAutomationRule(row) };
}

export async function updateAutomationRule(
  id: string,
  input: AutomationRuleInput,
): Promise<AutomacoesActionState<AutomationRule>> {
  const currentUser = await requireAutomacoesManager();
  if (!currentUser) return { error: "Você não tem permissão para editar regras de automação." };
  if (!input.name.trim()) return { error: "Preencha o nome da regra." };

  const row = await prisma.automationRule.update({
    where: { id, clinicId: currentUser.clinicId },
    data: {
      name: input.name.trim(),
      description: input.description || null,
      trigger: input.trigger,
      condition: input.condition ?? Prisma.JsonNull,
      action: input.action,
      status: input.status,
      targetPatientIds: input.targetPatientIds ?? [],
    },
  });

  revalidatePath("/automacoes");
  return { data: mapAutomationRule(row) };
}

export async function toggleAutomationStatus(
  id: string,
): Promise<AutomacoesActionState<AutomationRule>> {
  const currentUser = await requireAutomacoesManager();
  if (!currentUser) return { error: "Você não tem permissão para alterar esta regra." };

  const existing = await prisma.automationRule.findUnique({
    where: { id, clinicId: currentUser.clinicId },
  });
  if (!existing) return { error: "Regra não encontrada." };

  const row = await prisma.automationRule.update({
    where: { id, clinicId: currentUser.clinicId },
    data: { status: existing.status === "ativa" ? "pausada" : "ativa" },
  });

  revalidatePath("/automacoes");
  return { data: mapAutomationRule(row) };
}

export async function deleteAutomationRule(id: string): Promise<AutomacoesActionState> {
  const currentUser = await requireAutomacoesManager();
  if (!currentUser) return { error: "Você não tem permissão para remover regras de automação." };

  await prisma.automationRule.delete({ where: { id, clinicId: currentUser.clinicId } });

  revalidatePath("/automacoes");
  return {};
}

/** Grava no log a abertura do WhatsApp Web pra um paciente (clique em "Abrir WhatsApp"). */
export async function logWhatsAppDispatch(
  ruleId: string,
  patientId: string,
  message: string,
): Promise<AutomacoesActionState> {
  const currentUser = await requireAutomacoesManager();
  if (!currentUser) return { error: "Você não tem permissão para registrar este envio." };

  const rule = await prisma.automationRule.findUnique({
    where: { id: ruleId, clinicId: currentUser.clinicId },
  });
  if (!rule) return { error: "Regra não encontrada." };

  await prisma.$transaction([
    prisma.automationLog.create({
      data: {
        clinicId: currentUser.clinicId,
        ruleId,
        patientId,
        channel: "whatsapp",
        message,
      },
    }),
    prisma.automationRule.update({ where: { id: ruleId }, data: { lastTriggeredAt: new Date() } }),
  ]);

  revalidatePath("/automacoes");
  return {};
}

async function loadEngineContext(clinicId: string) {
  const [patientRows, appointmentRows, budgetRows] = await Promise.all([
    prisma.patient.findMany({ where: { clinicId } }),
    prisma.appointment.findMany({ where: { clinicId } }),
    prisma.budget.findMany({ where: { clinicId }, include: { items: true } }),
  ]);

  return {
    patients: patientRows.map(mapPatient),
    appointments: appointmentRows.map((row) => ({
      patientName: row.patientName ?? undefined,
      date: row.date,
      startTime: row.startTime,
      status: row.status,
      professionalId: row.professionalId,
    })),
    budgets: budgetRows.map((row) => ({
      patientId: row.patientId,
      status: row.status,
      total: computeBudgetTotals({
        items: row.items.map((item) => ({
          id: item.id,
          procedureId: item.procedureId,
          amount: Number(item.amount),
        })),
        discountPercent: Number(row.discountPercent),
      }).total,
    })),
    today: new Date(),
  };
}

export type RunAutomationResult = {
  sent: number;
  skippedNoEmail: number;
  skippedSendError: number;
};

/**
 * "Executar agora": avalia o gatilho da regra contra dados reais e dispara
 * de verdade os canais que têm envio automatizável (e-mail via Resend,
 * notificação interna vira só um registro em log). WhatsApp não entra aqui —
 * continua manual via os diálogos de envio (sem API, ver lib/whatsapp.ts).
 */
export async function runAutomationNow(
  ruleId: string,
): Promise<AutomacoesActionState<RunAutomationResult>> {
  const currentUser = await requireAutomacoesManager();
  if (!currentUser) return { error: "Você não tem permissão para executar esta regra." };

  const row = await prisma.automationRule.findUnique({
    where: { id: ruleId, clinicId: currentUser.clinicId },
  });
  if (!row) return { error: "Regra não encontrada." };

  const rule = mapAutomationRule(row);
  if (rule.action.channel === "whatsapp") {
    return { error: "WhatsApp é enviado manualmente pelos diálogos de envio." };
  }

  let sent = 0;
  let skippedNoEmail = 0;
  let skippedSendError = 0;
  const logs: { patientId?: string; targetLabel?: string; message: string }[] = [];

  if (rule.trigger.type === "estoque_abaixo_minimo") {
    const stockItemRows = await prisma.stockItem.findMany({ where: { clinicId: currentUser.clinicId } });
    const eligible = computeEligibleStockItems(rule, stockItemRows.map(mapStockItem));
    for (const item of eligible) {
      const message = resolveMessageTemplateFull(rule.action.message, { item: item.name });
      logs.push({ targetLabel: item.name, message });
    }
  } else if (rule.trigger.type !== "promocao") {
    const context = await loadEngineContext(currentUser.clinicId);
    const eligible = computeEligiblePatients(rule, context);
    for (const patient of eligible) {
      const message = resolveMessageTemplateFull(rule.action.message, { patient, referenceDate: context.today });
      if (rule.action.channel === "email") {
        if (!patient.email) {
          skippedNoEmail++;
          continue;
        }
        const { error } = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL!,
          to: patient.email,
          subject: rule.name,
          text: message,
        });
        if (error) {
          skippedSendError++;
          continue;
        }
      }
      logs.push({ patientId: patient.id, message });
    }
  } else {
    return { error: "Regras de promoção são enviadas via WhatsApp com a lista de pacientes escolhida." };
  }

  if (logs.length === 0) {
    return { data: { sent: 0, skippedNoEmail, skippedSendError } };
  }

  await prisma.$transaction([
    prisma.automationLog.createMany({
      data: logs.map((log) => ({
        clinicId: currentUser.clinicId,
        ruleId,
        patientId: log.patientId,
        targetLabel: log.targetLabel,
        channel: rule.action.channel,
        message: log.message,
      })),
    }),
    prisma.automationRule.update({ where: { id: ruleId }, data: { lastTriggeredAt: new Date() } }),
  ]);
  sent = logs.length;

  revalidatePath("/automacoes");
  return { data: { sent, skippedNoEmail, skippedSendError } };
}
