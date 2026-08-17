"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth";
import type { Prisma } from "@/lib/generated/prisma/client";
import type { BudgetStatus } from "@/lib/orcamento-status";
import {
  computeBudgetTotals,
  mapBudget,
  mapProcedure,
  type Budget,
  type Procedure,
} from "@/lib/orcamentos-types";
import { prisma } from "@/lib/prisma";

export type OrcamentosActionState<T = undefined> = {
  error?: string;
  data?: T;
};

async function requireOrcamentosManager() {
  const currentUser = await getCurrentUser();
  if (!currentUser || !["recepcionista", "gestor"].includes(currentUser.role)) {
    return null;
  }
  return currentUser;
}

type ProcedureInput = {
  name: string;
  category: string;
  price: number;
  durationMinutes: number;
};

export async function createProcedure(
  input: ProcedureInput,
): Promise<OrcamentosActionState<Procedure>> {
  const currentUser = await requireOrcamentosManager();
  if (!currentUser) return { error: "Você não tem permissão para cadastrar procedimentos." };
  if (!input.name.trim()) return { error: "Preencha o nome do procedimento." };

  const row = await prisma.procedure.create({
    data: {
      clinicId: currentUser.clinicId,
      name: input.name.trim(),
      category: input.category,
      price: input.price,
      durationMinutes: input.durationMinutes,
    },
  });

  revalidatePath("/orcamentos");
  return { data: mapProcedure(row) };
}

export async function updateProcedure(
  id: string,
  input: ProcedureInput,
): Promise<OrcamentosActionState<Procedure>> {
  const currentUser = await requireOrcamentosManager();
  if (!currentUser) return { error: "Você não tem permissão para editar procedimentos." };
  if (!input.name.trim()) return { error: "Preencha o nome do procedimento." };

  const row = await prisma.procedure.update({
    where: { id, clinicId: currentUser.clinicId },
    data: {
      name: input.name.trim(),
      category: input.category,
      price: input.price,
      durationMinutes: input.durationMinutes,
    },
  });

  revalidatePath("/orcamentos");
  return { data: mapProcedure(row) };
}

export async function deleteProcedure(id: string): Promise<OrcamentosActionState> {
  const currentUser = await requireOrcamentosManager();
  if (!currentUser) return { error: "Você não tem permissão para remover procedimentos." };

  await prisma.procedure.delete({ where: { id, clinicId: currentUser.clinicId } });

  revalidatePath("/orcamentos");
  return {};
}

type BudgetInput = {
  patientId: string;
  responsibleProfessionalId?: string;
  items: { procedureId: string; amount: number }[];
  discountPercent: number;
  validUntil: string;
  status: BudgetStatus;
  notes?: string;
};

/** Cria a cobrança vinculada quando um orçamento passa a "aprovado" — só uma vez por orçamento. */
async function ensureChargeForApprovedBudget(
  tx: Prisma.TransactionClient,
  budgetId: string,
  clinicId: string,
) {
  const existingCharge = await tx.charge.findFirst({ where: { budgetId } });
  if (existingCharge) return;

  const budget = await tx.budget.findUnique({ where: { id: budgetId }, include: { items: true } });
  if (!budget) return;

  const totals = computeBudgetTotals({
    items: budget.items.map((item) => ({
      id: item.id,
      procedureId: item.procedureId,
      amount: Number(item.amount),
    })),
    discountPercent: Number(budget.discountPercent),
  });

  await tx.charge.create({
    data: {
      clinicId,
      patientId: budget.patientId,
      sourceType: "orcamento",
      budgetId: budget.id,
      description: "Orçamento aprovado",
      amount: totals.total,
      dueDate: budget.validUntil,
      status: "pendente",
    },
  });
}

export async function createBudget(input: BudgetInput): Promise<OrcamentosActionState<Budget>> {
  const currentUser = await requireOrcamentosManager();
  if (!currentUser) return { error: "Você não tem permissão para criar orçamentos." };
  if (input.items.length === 0) return { error: "Adicione pelo menos um item." };

  const row = await prisma.$transaction(async (tx) => {
    const budget = await tx.budget.create({
      data: {
        clinicId: currentUser.clinicId,
        patientId: input.patientId,
        responsibleProfessionalId: input.responsibleProfessionalId || undefined,
        discountPercent: input.discountPercent,
        validUntil: input.validUntil,
        status: input.status,
        notes: input.notes || undefined,
        items: {
          create: input.items.map((item) => ({
            procedureId: item.procedureId,
            amount: item.amount,
          })),
        },
      },
      include: { items: true },
    });

    if (budget.status === "aprovado") {
      await ensureChargeForApprovedBudget(tx, budget.id, currentUser.clinicId);
    }

    return budget;
  });

  revalidatePath("/orcamentos");
  revalidatePath("/financeiro");
  return { data: mapBudget(row) };
}

export async function updateBudget(
  id: string,
  input: BudgetInput,
): Promise<OrcamentosActionState<Budget>> {
  const currentUser = await requireOrcamentosManager();
  if (!currentUser) return { error: "Você não tem permissão para editar orçamentos." };
  if (input.items.length === 0) return { error: "Adicione pelo menos um item." };

  const row = await prisma.$transaction(async (tx) => {
    await tx.budgetItem.deleteMany({ where: { budgetId: id } });

    const budget = await tx.budget.update({
      where: { id, clinicId: currentUser.clinicId },
      data: {
        patientId: input.patientId,
        responsibleProfessionalId: input.responsibleProfessionalId || null,
        discountPercent: input.discountPercent,
        validUntil: input.validUntil,
        status: input.status,
        notes: input.notes || null,
        items: {
          create: input.items.map((item) => ({
            procedureId: item.procedureId,
            amount: item.amount,
          })),
        },
      },
      include: { items: true },
    });

    if (budget.status === "aprovado") {
      await ensureChargeForApprovedBudget(tx, budget.id, currentUser.clinicId);
    }

    return budget;
  });

  revalidatePath("/orcamentos");
  revalidatePath("/financeiro");
  return { data: mapBudget(row) };
}

export async function deleteBudget(id: string): Promise<OrcamentosActionState> {
  const currentUser = await requireOrcamentosManager();
  if (!currentUser) return { error: "Você não tem permissão para remover orçamentos." };

  await prisma.budget.delete({ where: { id, clinicId: currentUser.clinicId } });

  revalidatePath("/orcamentos");
  return {};
}

export async function updateBudgetStatus(
  id: string,
  status: BudgetStatus,
): Promise<OrcamentosActionState<Budget>> {
  const currentUser = await requireOrcamentosManager();
  if (!currentUser) return { error: "Você não tem permissão para alterar o status do orçamento." };

  const row = await prisma.$transaction(async (tx) => {
    const budget = await tx.budget.update({
      where: { id, clinicId: currentUser.clinicId },
      data: { status },
      include: { items: true },
    });

    if (status === "aprovado") {
      await ensureChargeForApprovedBudget(tx, budget.id, currentUser.clinicId);
    }

    return budget;
  });

  revalidatePath("/orcamentos");
  revalidatePath("/financeiro");
  return { data: mapBudget(row) };
}
