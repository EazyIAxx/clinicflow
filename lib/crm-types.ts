import { differenceInCalendarDays } from "date-fns";

import type {
  Lead as LeadRow,
  LeadInteraction as InteractionRow,
  LeadOrigin as PrismaLeadOrigin,
} from "@/lib/generated/prisma/client";
import type { LeadStage } from "@/lib/lead-status";

export const NO_RETURN_THRESHOLD_DAYS = 3;
const activeStages = new Set<LeadStage>(["novo", "em_conversa", "agendado"]);

export type LeadOrigin = "Instagram" | "Indicação" | "Google" | "WhatsApp" | "Site" | "Outro";

export type Lead = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  origin: LeadOrigin;
  interest: string;
  responsibleProfessionalId?: string;
  stage: LeadStage;
  notes?: string;
  convertedPatientId?: string;
  createdAt: string; // yyyy-MM-dd
};

export type InteractionType = "nota" | "ligacao" | "mensagem";

export type Interaction = {
  id: string;
  leadId: string;
  type: InteractionType;
  content: string;
  date: string; // yyyy-MM-dd
  author: string;
};

export const originOptions: LeadOrigin[] = [
  "Instagram",
  "Indicação",
  "Google",
  "WhatsApp",
  "Site",
  "Outro",
];

const originToSlug: Record<LeadOrigin, PrismaLeadOrigin> = {
  Instagram: "instagram",
  Indicação: "indicacao",
  Google: "google",
  WhatsApp: "whatsapp",
  Site: "site",
  Outro: "outro",
};

const slugToOrigin: Record<PrismaLeadOrigin, LeadOrigin> = {
  instagram: "Instagram",
  indicacao: "Indicação",
  google: "Google",
  whatsapp: "WhatsApp",
  site: "Site",
  outro: "Outro",
};

export function originToPrisma(origin: LeadOrigin): PrismaLeadOrigin {
  return originToSlug[origin];
}

/** Data da interação mais recente do lead, ou undefined se nunca houve contato registrado. */
export function getLastInteractionDate(leadId: string, interactions: Interaction[]) {
  const dates = interactions
    .filter((interaction) => interaction.leadId === leadId)
    .map((interaction) => interaction.date)
    .sort();
  return dates.at(-1);
}

/** Dias desde a última interação, ou undefined se nunca houve contato registrado. */
export function getDaysSinceLastContact(
  leadId: string,
  interactions: Interaction[],
  referenceDate: Date,
) {
  const lastInteraction = getLastInteractionDate(leadId, interactions);
  return lastInteraction
    ? differenceInCalendarDays(referenceDate, new Date(`${lastInteraction}T00:00:00`))
    : undefined;
}

/** Um lead está "sem retorno" se ainda está em etapa ativa e faz tempo que não há contato. */
export function isLeadStale(lead: Lead, interactions: Interaction[], referenceDate: Date) {
  if (!activeStages.has(lead.stage)) return false;
  const days = getDaysSinceLastContact(lead.id, interactions, referenceDate);
  return days !== undefined && days >= NO_RETURN_THRESHOLD_DAYS;
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function mapLead(row: LeadRow): Lead {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email ?? undefined,
    origin: slugToOrigin[row.origin],
    interest: row.interest,
    responsibleProfessionalId: row.responsibleProfessionalId ?? undefined,
    stage: row.stage,
    notes: row.notes ?? undefined,
    convertedPatientId: row.convertedPatientId ?? undefined,
    createdAt: toDateKey(row.createdAt),
  };
}

export function mapInteraction(row: InteractionRow): Interaction {
  return {
    id: row.id,
    leadId: row.leadId,
    type: row.type,
    content: row.content,
    date: row.date,
    author: row.author,
  };
}
