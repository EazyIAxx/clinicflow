import { format, subDays } from "date-fns";
import { Cake, CalendarClock, FileCheck2, Mail, MessageCircle, PackageX } from "lucide-react";

import type { AutomationStatus } from "@/lib/automacao-status";

export type AutomationTriggerType =
  "dias_apos_consulta" | "estoque_abaixo_minimo" | "aniversario_paciente" | "orcamento_aprovado";

export type AutomationTrigger =
  | { type: "dias_apos_consulta"; days: number }
  | { type: "estoque_abaixo_minimo" }
  | { type: "aniversario_paciente" }
  | { type: "orcamento_aprovado" };

export type AutomationConditionField =
  "categoria_estoque" | "profissional" | "valor_minimo_orcamento";
export type AutomationConditionOperator = "igual" | "maior_que" | "menor_que";

export type AutomationCondition = {
  field: AutomationConditionField;
  operator: AutomationConditionOperator;
  value: string;
};

export type AutomationActionChannel = "whatsapp" | "email" | "notificacao_interna";

export type AutomationAction = {
  channel: AutomationActionChannel;
  message: string;
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
 * 4 tipos de gatilho, mistura de ativa/pausada e com/sem condição.
 */
export function getMockAutomationRules(referenceDate: Date): AutomationRule[] {
  const ago = (days: number) => dateKey(subDays(referenceDate, days));

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
      },
      status: "pausada",
      createdAt: ago(75),
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
      },
    }),
  },
];
