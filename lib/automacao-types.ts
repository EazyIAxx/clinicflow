import { addHours, format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Cake,
  CalendarCheck,
  CalendarClock,
  FileCheck2,
  Mail,
  Megaphone,
  MessageCircle,
  PackageX,
} from "lucide-react";

import type { AutomationStatus } from "@/lib/automacao-status";
import type { StockCategory, StockItem } from "@/lib/estoque-types";
import type { AutomationRule as AutomationRuleRow } from "@/lib/generated/prisma/client";
import type { Patient } from "@/lib/patient-types";

export type AutomationTriggerType =
  | "dias_apos_consulta"
  | "estoque_abaixo_minimo"
  | "aniversario_paciente"
  | "orcamento_aprovado"
  | "lembrete_consulta_confirmada"
  | "promocao";

export type AutomationTrigger =
  | { type: "dias_apos_consulta"; days: number }
  | { type: "estoque_abaixo_minimo" }
  | { type: "aniversario_paciente" }
  | { type: "orcamento_aprovado" }
  | { type: "lembrete_consulta_confirmada"; hours: number }
  | { type: "promocao"; date: string };

/**
 * `profissional` guarda o id real do Professional; `categoria_estoque` guarda
 * o slug real de StockCategory — ambos escolhidos por Select, não texto
 * livre, pra comparação exata contra os dados reais no motor de avaliação.
 */
export type AutomationConditionField =
  | "categoria_estoque"
  | "profissional"
  | "valor_minimo_orcamento";
export type AutomationConditionOperator = "igual" | "maior_que" | "menor_que";

export type AutomationCondition = {
  field: AutomationConditionField;
  operator: AutomationConditionOperator;
  value: string;
};

export type AutomationActionChannel = "whatsapp" | "email" | "notificacao_interna";

export type AutomationFollowUp = {
  delayDays: number;
  message: string;
};

export type AutomationAction = {
  channel: AutomationActionChannel;
  message: string;
  sendTime?: string; // "HH:mm" — horário do dia em que a mensagem é enviada
  followUp?: AutomationFollowUp;
};

export type AutomationRule = {
  id: string;
  name: string;
  description?: string;
  trigger: AutomationTrigger;
  condition: AutomationCondition | null;
  action: AutomationAction;
  status: AutomationStatus;
  createdAt: string; // yyyy-MM-dd
  lastTriggeredAt?: string; // yyyy-MM-dd
  targetPatientIds?: string[];
};

export const automationTriggerMeta: Record<
  AutomationTriggerType,
  { label: string; icon: typeof CalendarClock; description: string }
> = {
  dias_apos_consulta: {
    label: "Após consulta",
    icon: CalendarClock,
    description: "X dias depois de uma consulta confirmada",
  },
  estoque_abaixo_minimo: {
    label: "Estoque baixo",
    icon: PackageX,
    description: "Quando um item de estoque cai abaixo do mínimo",
  },
  aniversario_paciente: {
    label: "Aniversário",
    icon: Cake,
    description: "No aniversário do paciente",
  },
  orcamento_aprovado: {
    label: "Orçamento aprovado",
    icon: FileCheck2,
    description: "Quando um orçamento é aprovado pelo paciente",
  },
  lembrete_consulta_confirmada: {
    label: "Consulta confirmada",
    icon: CalendarCheck,
    description: "X horas antes de uma consulta confirmada",
  },
  promocao: {
    label: "Promoção",
    icon: Megaphone,
    description: "Em uma data específica (campanha promocional)",
  },
};

export const automationConditionFieldLabels: Record<AutomationConditionField, string> = {
  categoria_estoque: "Categoria do item",
  profissional: "Profissional",
  valor_minimo_orcamento: "Valor mínimo do orçamento",
};

export const automationConditionOperatorLabels: Record<AutomationConditionOperator, string> = {
  igual: "é igual a",
  maior_que: "é maior que",
  menor_que: "é menor que",
};

export const automationActionChannelMeta: Record<
  AutomationActionChannel,
  { label: string; icon: typeof MessageCircle }
> = {
  whatsapp: { label: "WhatsApp", icon: MessageCircle },
  email: { label: "E-mail", icon: Mail },
  notificacao_interna: { label: "Notificação interna", icon: Mail },
};

export type AutomationTemplate = {
  key: string;
  name: string;
  description: string;
  icon: typeof CalendarClock;
  build: () => Pick<AutomationRule, "name" | "description" | "trigger" | "condition" | "action">;
};

export const automationTemplates: AutomationTemplate[] = [
  {
    key: "lembrete-retorno",
    name: "Lembrete de retorno",
    description: "Convida o paciente a agendar um retorno alguns dias após a consulta.",
    icon: CalendarClock,
    build: () => ({
      name: "Lembrete de retorno",
      description: "Convida o paciente a agendar um retorno após a consulta.",
      trigger: { type: "dias_apos_consulta", days: 30 },
      condition: null,
      action: {
        channel: "whatsapp",
        message:
          "Olá {{paciente}}! Já faz um tempo da sua última consulta. Vamos agendar um retorno?",
        sendTime: "09:00",
      },
    }),
  },
  {
    key: "estoque-baixo",
    name: "Estoque baixo",
    description: "Notifica a equipe quando um item de estoque cai abaixo do mínimo.",
    icon: PackageX,
    build: () => ({
      name: "Alerta de estoque baixo",
      description: "Avisa a gestão quando um item fica abaixo do estoque mínimo.",
      trigger: { type: "estoque_abaixo_minimo" },
      condition: null,
      action: {
        channel: "notificacao_interna",
        message: "O item {{item}} está abaixo do estoque mínimo. Reabastecer.",
        sendTime: "09:00",
      },
    }),
  },
  {
    key: "aniversario-paciente",
    name: "Aniversário do paciente",
    description: "Envia uma mensagem de parabéns automática no aniversário do paciente.",
    icon: Cake,
    build: () => ({
      name: "Feliz aniversário",
      description: "Mensagem de parabéns automática no aniversário do paciente.",
      trigger: { type: "aniversario_paciente" },
      condition: null,
      action: {
        channel: "whatsapp",
        message: "Feliz aniversário, {{paciente}}! A equipe da clínica deseja um ótimo dia. 🎉",
        sendTime: "09:00",
      },
    }),
  },
];

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function mapAutomationRule(row: AutomationRuleRow): AutomationRule {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    trigger: row.trigger as AutomationTrigger,
    condition: (row.condition as AutomationCondition | null) ?? null,
    action: row.action as AutomationAction,
    status: row.status,
    createdAt: toDateKey(row.createdAt),
    lastTriggeredAt: row.lastTriggeredAt ? toDateKey(row.lastTriggeredAt) : undefined,
    targetPatientIds: row.targetPatientIds.length > 0 ? row.targetPatientIds : undefined,
  };
}

/** Resolve os placeholders com valor disponível num envio manual ad-hoc. */
export function resolveMessageTemplate(
  template: string,
  patient: Patient,
  referenceDate: Date,
): string {
  return template
    .replaceAll("{{paciente}}", patient.name)
    .replaceAll("{{data}}", format(referenceDate, "dd/MM/yyyy", { locale: ptBR }));
}

/**
 * Resolvedor completo usado pelo motor real de execução — além de
 * paciente/data, também resolve {{item}} e {{hora}} quando disponíveis
 * (não dá pra resolver fora da execução real, por isso ficavam como estão
 * no editor da regra).
 */
export function resolveMessageTemplateFull(
  template: string,
  opts: { patient?: Patient; item?: string; hora?: string; referenceDate?: Date },
): string {
  const referenceDate = opts.referenceDate ?? new Date();
  let result = template.replaceAll("{{data}}", format(referenceDate, "dd/MM/yyyy", { locale: ptBR }));
  if (opts.patient) result = result.replaceAll("{{paciente}}", opts.patient.name);
  if (opts.item) result = result.replaceAll("{{item}}", opts.item);
  if (opts.hora) result = result.replaceAll("{{hora}}", opts.hora);
  return result;
}

// ---------------------------------------------------------------------------
// Motor de avaliação real — calcula, a partir dos dados reais da clínica,
// quem/o que bate com o gatilho de uma regra agora. Sem cron: é chamado sob
// demanda (ao abrir os diálogos de envio, ou no "Executar agora").
// ---------------------------------------------------------------------------

export type AutomationEngineAppointment = {
  patientName?: string;
  date: string; // yyyy-MM-dd
  startTime: string; // HH:mm
  status: string;
  professionalId: string;
};

export type AutomationEngineBudget = {
  patientId: string;
  status: string;
  total: number;
};

export type AutomationEngineContext = {
  patients: Patient[];
  appointments: AutomationEngineAppointment[];
  budgets: AutomationEngineBudget[];
  today: Date;
};

function dedupeById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const item of items) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    result.push(item);
  }
  return result;
}

function findPatientByExactName(patients: Patient[], name: string | undefined): Patient | undefined {
  if (!name) return undefined;
  const normalized = name.trim().toLowerCase();
  return patients.find((patient) => patient.name.trim().toLowerCase() === normalized);
}

function compareNumeric(value: number, operator: AutomationConditionOperator, target: number): boolean {
  if (operator === "igual") return value === target;
  if (operator === "maior_que") return value > target;
  return value < target;
}

/**
 * Pacientes elegíveis agora pra gatilhos que têm alvo-paciente natural.
 * "promoção" não entra aqui (usa `targetPatientIds`, escolhido à mão) e
 * "estoque_abaixo_minimo" não tem paciente como alvo (ver
 * `computeEligibleStockItems`).
 *
 * `dias_apos_consulta`/`lembrete_consulta_confirmada` casam o paciente pelo
 * nome (`Appointment.patientName`), porque a Agenda ainda não referencia
 * `Patient.id` diretamente — mesma consulta vira pendência de outro
 * milestone, não deste.
 */
export function computeEligiblePatients(
  rule: Pick<AutomationRule, "trigger" | "condition">,
  ctx: AutomationEngineContext,
): Patient[] {
  const { trigger, condition } = rule;

  if (trigger.type === "dias_apos_consulta") {
    const targetDate = format(subDays(ctx.today, trigger.days), "yyyy-MM-dd");
    const matches = ctx.appointments.filter(
      (appointment) => appointment.date === targetDate && appointment.status === "confirmada",
    );
    const filtered =
      condition?.field === "profissional"
        ? matches.filter((appointment) => appointment.professionalId === condition.value)
        : matches;
    return dedupeById(
      filtered
        .map((appointment) => findPatientByExactName(ctx.patients, appointment.patientName))
        .filter((patient): patient is Patient => Boolean(patient)),
    );
  }

  if (trigger.type === "aniversario_paciente") {
    const monthDay = format(ctx.today, "yyyy-MM-dd").slice(5);
    return ctx.patients.filter((patient) => patient.birthDate.slice(5) === monthDay);
  }

  if (trigger.type === "orcamento_aprovado") {
    const eligibleBudgets = ctx.budgets.filter((budget) => {
      if (budget.status !== "aprovado") return false;
      if (condition?.field !== "valor_minimo_orcamento") return true;
      return compareNumeric(budget.total, condition.operator, Number(condition.value));
    });
    const patientIds = new Set(eligibleBudgets.map((budget) => budget.patientId));
    return ctx.patients.filter((patient) => patientIds.has(patient.id));
  }

  if (trigger.type === "lembrete_consulta_confirmada") {
    const targetDate = format(addHours(ctx.today, trigger.hours), "yyyy-MM-dd");
    return dedupeById(
      ctx.appointments
        .filter(
          (appointment) => appointment.date === targetDate && appointment.status === "confirmada",
        )
        .map((appointment) => findPatientByExactName(ctx.patients, appointment.patientName))
        .filter((patient): patient is Patient => Boolean(patient)),
    );
  }

  return [];
}

/** Itens de estoque elegíveis agora — só o gatilho "estoque_abaixo_minimo" tem alvo aqui. */
export function computeEligibleStockItems(
  rule: Pick<AutomationRule, "trigger" | "condition">,
  stockItems: StockItem[],
): StockItem[] {
  if (rule.trigger.type !== "estoque_abaixo_minimo") return [];
  const belowMinimum = stockItems.filter((item) => item.quantity < item.minQuantity);
  if (rule.condition?.field === "categoria_estoque") {
    const category = rule.condition.value as StockCategory;
    return belowMinimum.filter((item) => item.category === category);
  }
  return belowMinimum;
}
