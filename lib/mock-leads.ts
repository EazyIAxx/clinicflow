import { differenceInCalendarDays, format, subDays } from "date-fns";

import { professionals } from "@/lib/mock-agenda";
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

export function responsibleProfessionalName(lead: Pick<Lead, "responsibleProfessionalId">) {
  return professionals.find((professional) => professional.id === lead.responsibleProfessionalId)
    ?.name;
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

const dateKey = (date: Date) => format(date, "yyyy-MM-dd");

/**
 * Gera leads mockados com data de criação ancorada em `referenceDate`, mesmo
 * motivo dos outros módulos: os indicadores ("sem retorno há X dias") não
 * podem depender de quando a página é aberta.
 */
export function getMockLeads(referenceDate: Date): Lead[] {
  const ago = (days: number) => dateKey(subDays(referenceDate, days));

  return [
    {
      id: "lead-1",
      name: "Bianca Ferreira",
      phone: "(11) 98123-4455",
      email: "bianca.ferreira@email.com",
      origin: "Instagram",
      interest: "Avaliação dermatológica",
      responsibleProfessionalId: "prof-3",
      stage: "novo",
      createdAt: ago(1),
    },
    {
      id: "lead-2",
      name: "Carlos Eduardo Souza",
      phone: "(11) 97234-5566",
      origin: "Google",
      interest: "Check-up geral",
      responsibleProfessionalId: "prof-1",
      stage: "novo",
      createdAt: ago(2),
    },
    {
      id: "lead-3",
      name: "Débora Martins",
      phone: "(11) 96345-6677",
      email: "debora.martins@email.com",
      origin: "Indicação",
      interest: "Consulta ortodôntica",
      responsibleProfessionalId: "prof-2",
      stage: "em_conversa",
      notes: "Indicada pela paciente Larissa Fernandes.",
      createdAt: ago(5),
    },
    {
      id: "lead-4",
      name: "Felipe Rocha",
      phone: "(11) 95456-7788",
      origin: "WhatsApp",
      interest: "Fisioterapia - dor lombar",
      responsibleProfessionalId: "prof-4",
      stage: "em_conversa",
      createdAt: ago(4),
    },
    {
      id: "lead-5",
      name: "Gabriela Lopes",
      phone: "(11) 94567-8899",
      email: "gabriela.lopes@email.com",
      origin: "Site",
      interest: "Avaliação nutricional",
      responsibleProfessionalId: "prof-5",
      stage: "em_conversa",
      createdAt: ago(8),
    },
    {
      id: "lead-6",
      name: "Henrique Costa",
      phone: "(11) 93678-9900",
      origin: "Instagram",
      interest: "Clareamento dental",
      responsibleProfessionalId: "prof-2",
      stage: "agendado",
      createdAt: ago(10),
    },
    {
      id: "lead-7",
      name: "Isabela Ramos",
      phone: "(11) 92789-0011",
      email: "isabela.ramos@email.com",
      origin: "Indicação",
      interest: "Consulta dermatológica",
      responsibleProfessionalId: "prof-3",
      stage: "agendado",
      createdAt: ago(6),
    },
    {
      id: "lead-8",
      name: "João Pedro Alves",
      phone: "(11) 91890-1122",
      origin: "Google",
      interest: "Check-up geral",
      responsibleProfessionalId: "prof-1",
      stage: "convertido",
      createdAt: ago(20),
    },
    {
      id: "lead-9",
      name: "Karina Dias",
      phone: "(11) 90901-2233",
      email: "karina.dias@email.com",
      origin: "WhatsApp",
      interest: "Avaliação nutricional",
      responsibleProfessionalId: "prof-5",
      stage: "convertido",
      createdAt: ago(25),
    },
    {
      id: "lead-10",
      name: "Leonardo Cardoso",
      phone: "(11) 99012-3344",
      origin: "Site",
      interest: "Extração de sisos",
      responsibleProfessionalId: "prof-2",
      stage: "perdido",
      notes: "Sem disponibilidade financeira no momento.",
      createdAt: ago(15),
    },
    {
      id: "lead-11",
      name: "Mariana Teixeira",
      phone: "(11) 98023-4455",
      email: "mariana.teixeira@email.com",
      origin: "Outro",
      interest: "Fisioterapia esportiva",
      stage: "novo",
      createdAt: ago(0),
    },
    {
      id: "lead-12",
      name: "Otávio Barros",
      phone: "(11) 97134-5566",
      origin: "Instagram",
      interest: "Consulta ortodôntica",
      responsibleProfessionalId: "prof-2",
      stage: "em_conversa",
      createdAt: ago(12),
    },
  ];
}

/**
 * Gera o histórico de interações mockado, ancorado em `referenceDate`.
 */
export function getMockInteractions(referenceDate: Date): Interaction[] {
  const ago = (days: number) => dateKey(subDays(referenceDate, days));

  return [
    {
      id: "int-1",
      leadId: "lead-1",
      type: "nota",
      content:
        "Respondeu ao anúncio no Instagram, perguntou sobre preços de avaliação dermatológica.",
      date: ago(1),
      author: "Ana Souza",
    },
    {
      id: "int-2",
      leadId: "lead-2",
      type: "mensagem",
      content: "Mandou mensagem perguntando sobre convênio.",
      date: ago(2),
      author: "Juliana Andrade",
    },
    {
      id: "int-3",
      leadId: "lead-3",
      type: "mensagem",
      content: "Primeiro contato via indicação, explicou o interesse.",
      date: ago(5),
      author: "Juliana Andrade",
    },
    {
      id: "int-4",
      leadId: "lead-3",
      type: "ligacao",
      content: "Conversamos sobre valores do tratamento ortodôntico, vai pensar.",
      date: ago(2),
      author: "Marcos Tavares",
    },
    {
      id: "int-5",
      leadId: "lead-4",
      type: "mensagem",
      content: "Relatou dor lombar recorrente, quer avaliação.",
      date: ago(4),
      author: "Marcos Tavares",
    },
    {
      id: "int-6",
      leadId: "lead-4",
      type: "nota",
      content: "Confirmou interesse, aguardando horário compatível com a agenda dele.",
      date: ago(1),
      author: "Marcos Tavares",
    },
    {
      id: "int-7",
      leadId: "lead-5",
      type: "mensagem",
      content: "Preencheu formulário do site pedindo avaliação nutricional.",
      date: ago(8),
      author: "Juliana Andrade",
    },
    {
      id: "int-8",
      leadId: "lead-6",
      type: "mensagem",
      content: "Perguntou sobre clareamento dental pelo Instagram.",
      date: ago(10),
      author: "Ana Souza",
    },
    {
      id: "int-9",
      leadId: "lead-6",
      type: "ligacao",
      content: "Explicamos o procedimento e valores.",
      date: ago(9),
      author: "Marcos Tavares",
    },
    {
      id: "int-10",
      leadId: "lead-6",
      type: "nota",
      content: "Agendou avaliação para a semana que vem.",
      date: ago(8),
      author: "Marcos Tavares",
    },
    {
      id: "int-11",
      leadId: "lead-7",
      type: "mensagem",
      content: "Indicada por outra paciente, quer avaliação dermatológica.",
      date: ago(6),
      author: "Juliana Andrade",
    },
    {
      id: "int-12",
      leadId: "lead-7",
      type: "ligacao",
      content: "Consulta agendada.",
      date: ago(5),
      author: "Juliana Andrade",
    },
    {
      id: "int-13",
      leadId: "lead-8",
      type: "mensagem",
      content: "Primeiro contato pelo Google, interesse em check-up geral.",
      date: ago(20),
      author: "Ana Souza",
    },
    {
      id: "int-14",
      leadId: "lead-8",
      type: "ligacao",
      content: "Agendamos a primeira consulta.",
      date: ago(18),
      author: "Marcos Tavares",
    },
    {
      id: "int-15",
      leadId: "lead-8",
      type: "nota",
      content: "Virou paciente, primeira consulta realizada com sucesso.",
      date: ago(15),
      author: "Ana Souza",
    },
    {
      id: "int-16",
      leadId: "lead-9",
      type: "mensagem",
      content: "Perguntou sobre acompanhamento nutricional pelo WhatsApp.",
      date: ago(25),
      author: "Juliana Andrade",
    },
    {
      id: "int-17",
      leadId: "lead-9",
      type: "nota",
      content: "Convertida em paciente após a primeira consulta.",
      date: ago(20),
      author: "Ana Souza",
    },
    {
      id: "int-18",
      leadId: "lead-10",
      type: "mensagem",
      content: "Perguntou sobre extração de sisos pelo site.",
      date: ago(15),
      author: "Marcos Tavares",
    },
    {
      id: "int-19",
      leadId: "lead-10",
      type: "ligacao",
      content: "Relatou não ter disponibilidade financeira no momento, desistiu.",
      date: ago(12),
      author: "Marcos Tavares",
    },
    {
      id: "int-20",
      leadId: "lead-11",
      type: "mensagem",
      content: "Preencheu formulário do site hoje.",
      date: ago(0),
      author: "Juliana Andrade",
    },
    {
      id: "int-21",
      leadId: "lead-12",
      type: "mensagem",
      content: "Perguntou sobre aparelho ortodôntico pelo Instagram.",
      date: ago(12),
      author: "Ana Souza",
    },
  ];
}
