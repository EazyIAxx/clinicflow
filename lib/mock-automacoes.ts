import { addDays, format, subDays } from "date-fns";
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

export type AutomationConditionField =
  "categoria_estoque" | "profissional" | "valor_minimo_orcamento";
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
};

export const automationTriggerMeta: Record<
  AutomationTriggerType,
  { label: string; icon: typeof CalendarClock; description: string }
> = {
  dias_apos_consulta: {
    label: "Após consulta",
    icon: CalendarClock,
    description: "X dias depois de uma consulta realizada",
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

const dateKey = (date: Date) => format(date, "yyyy-MM-dd");

/**
 * Gera regras de automação mockadas ancoradas em `referenceDate`, cobrindo os
 * 6 tipos de gatilho, mistura de ativa/pausada e com/sem condição.
 */
export function getMockAutomationRules(referenceDate: Date): AutomationRule[] {
  const ago = (days: number) => dateKey(subDays(referenceDate, days));
  const future = (days: number) => dateKey(addDays(referenceDate, days));

  return [
    {
      id: "automacao-1",
      name: "Lembrete de retorno",
      description: "Convida o paciente a agendar um retorno um mês após a consulta.",
      trigger: { type: "dias_apos_consulta", days: 30 },
      condition: null,
      action: {
        channel: "whatsapp",
        message:
          "Olá {{paciente}}! Já faz um mês da sua última consulta. Que tal agendar um retorno?",
        sendTime: "09:00",
        followUp: {
          delayDays: 5,
          message: "Oi {{paciente}}, só passando pra lembrar do seu retorno. Vamos marcar?",
        },
      },
      status: "ativa",
      createdAt: ago(60),
      lastTriggeredAt: ago(2),
    },
    {
      id: "automacao-2",
      name: "Alerta de estoque baixo - Farmacêuticos",
      description: "Avisa a gestão quando itens farmacêuticos ficam abaixo do mínimo.",
      trigger: { type: "estoque_abaixo_minimo" },
      condition: { field: "categoria_estoque", operator: "igual", value: "Farmacêuticos" },
      action: {
        channel: "notificacao_interna",
        message: "O item {{item}} está abaixo do estoque mínimo. Reabastecer.",
        sendTime: "08:00",
      },
      status: "ativa",
      createdAt: ago(90),
      lastTriggeredAt: ago(5),
    },
    {
      id: "automacao-3",
      name: "Feliz aniversário",
      description: "Mensagem de parabéns automática no aniversário do paciente.",
      trigger: { type: "aniversario_paciente" },
      condition: null,
      action: {
        channel: "whatsapp",
        message: "Feliz aniversário, {{paciente}}! A equipe da clínica deseja um ótimo dia. 🎉",
        sendTime: "09:00",
      },
      status: "ativa",
      createdAt: ago(120),
      lastTriggeredAt: ago(14),
    },
    {
      id: "automacao-4",
      name: "Cobrança de orçamento aprovado",
      description:
        "Envia o link de pagamento assim que um orçamento acima de certo valor é aprovado.",
      trigger: { type: "orcamento_aprovado" },
      condition: { field: "valor_minimo_orcamento", operator: "maior_que", value: "500" },
      action: {
        channel: "email",
        message: "Seu orçamento foi aprovado! Segue o link de pagamento: {{link_pagamento}}",
        sendTime: "10:00",
        followUp: {
          delayDays: 3,
          message: "Olá {{paciente}}, ainda dá tempo de aproveitar seu orçamento aprovado!",
        },
      },
      status: "ativa",
      createdAt: ago(45),
    },
    {
      id: "automacao-5",
      name: "Lembrete de retorno - Fisioterapia",
      description: "Retorno mais cedo para pacientes de fisioterapia, específico por profissional.",
      trigger: { type: "dias_apos_consulta", days: 15 },
      condition: { field: "profissional", operator: "igual", value: "Dra. Camila Rocha" },
      action: {
        channel: "whatsapp",
        message: "Olá {{paciente}}, vamos agendar sua próxima sessão de fisioterapia?",
        sendTime: "09:00",
      },
      status: "pausada",
      createdAt: ago(20),
    },
    {
      id: "automacao-6",
      name: "Alerta de estoque baixo - Descartáveis",
      description: "Avisa quando itens descartáveis ficam abaixo do mínimo.",
      trigger: { type: "estoque_abaixo_minimo" },
      condition: { field: "categoria_estoque", operator: "igual", value: "Descartáveis" },
      action: {
        channel: "notificacao_interna",
        message: "O item {{item}} está abaixo do estoque mínimo. Reabastecer.",
        sendTime: "08:00",
      },
      status: "pausada",
      createdAt: ago(75),
    },
    {
      id: "automacao-7",
      name: "Lembrete de consulta amanhã",
      description: "Avisa o paciente sobre a consulta confirmada do dia seguinte.",
      trigger: { type: "lembrete_consulta_confirmada", hours: 24 },
      condition: null,
      action: {
        channel: "whatsapp",
        message: "Olá {{paciente}}, lembrando que sua consulta é amanhã às {{hora}}. Até lá!",
        sendTime: "18:00",
      },
      status: "ativa",
      createdAt: ago(40),
      lastTriggeredAt: ago(1),
    },
    {
      id: "automacao-8",
      name: "Promoção de Dia das Mães",
      description: "Campanha promocional enviada a todos os pacientes na data escolhida.",
      trigger: { type: "promocao", date: future(20) },
      condition: null,
      action: {
        channel: "email",
        message:
          "Prepare-se para o Dia das Mães! Condições especiais em procedimentos até {{data}}.",
        sendTime: "10:00",
      },
      status: "pausada",
      createdAt: ago(10),
    },
  ];
}

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
