import { differenceInCalendarDays } from "date-fns";
import { Handshake, Package, Receipt, Users, type LucideIcon } from "lucide-react";

import { formatDateKey } from "@/lib/agenda-time";
import type { Appointment } from "@/lib/mock-agenda";
import { isLeadStale, type Interaction, type Lead } from "@/lib/mock-leads";
import type { StockItem, StockMovement } from "@/lib/mock-estoque";
import type { Budget } from "@/lib/mock-orcamentos";
import type { Patient } from "@/lib/mock-pacientes";
import { getStockFlags } from "@/lib/stock-status";

/**
 * Consultas de hoje (exclui bloqueios e canceladas) ordenadas por horário,
 * mais a contagem de quantas ainda aguardam confirmação.
 */
export function getTodayAgendaSummary(appointments: Appointment[], referenceDate: Date) {
  const todayKey = formatDateKey(referenceDate);

  const todayAppointments = appointments
    .filter(
      (appointment) =>
        appointment.date === todayKey &&
        appointment.kind === "consulta" &&
        appointment.status !== "cancelada",
    )
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const pendingConfirmationCount = todayAppointments.filter(
    (appointment) => appointment.status === "pendente",
  ).length;

  return { todayAppointments, pendingConfirmationCount };
}

/**
 * Pendências que atravessam módulos: orçamentos aguardando resposta do
 * paciente, itens de estoque abaixo do mínimo e leads sem retorno — cada
 * critério reaproveita o predicado já existente no módulo de origem.
 */
export function getModulePendencies({
  budgets,
  stockItems,
  leads,
  interactions,
  referenceDate,
}: {
  budgets: Budget[];
  stockItems: StockItem[];
  leads: Lead[];
  interactions: Interaction[];
  referenceDate: Date;
}) {
  const pendingBudgets = budgets.filter((budget) => budget.status === "enviado");

  const criticalStockItems = stockItems.filter((item) =>
    getStockFlags({
      quantity: item.quantity,
      minQuantity: item.minQuantity,
      expiresAt: item.expiresAt,
      referenceDate,
    }).includes("baixo"),
  );

  const staleLeads = leads.filter((lead) => isLeadStale(lead, interactions, referenceDate));

  return { pendingBudgets, criticalStockItems, staleLeads };
}

export type ActivityItem = {
  id: string;
  description: string;
  date: string; // yyyy-MM-dd
  href: string;
  icon: LucideIcon;
};

/**
 * Feed de atividade recente, mesclando eventos com data confiável de cada
 * módulo (não inclui consultas: `Appointment` só tem a data em que a
 * consulta acontece, não a de criação, então não daria pra chamar de
 * "atividade recente" sem inventar um dado que não existe).
 */
export function getRecentActivity(
  {
    patients,
    budgets,
    leads,
    movements,
    patientsById,
    stockItemsById,
  }: {
    patients: Patient[];
    budgets: Budget[];
    leads: Lead[];
    movements: StockMovement[];
    patientsById: Record<string, Patient>;
    stockItemsById: Record<string, StockItem>;
  },
  limit: number,
): ActivityItem[] {
  const items: ActivityItem[] = [
    ...patients.map((patient) => ({
      id: `patient-${patient.id}`,
      description: `Paciente cadastrado: ${patient.name}`,
      date: patient.createdAt,
      href: `/pacientes/${patient.id}`,
      icon: Users,
    })),
    ...budgets.map((budget) => ({
      id: `budget-${budget.id}`,
      description: `Orçamento criado para ${patientsById[budget.patientId]?.name ?? "paciente"}`,
      date: budget.createdAt,
      href: "/orcamentos",
      icon: Receipt,
    })),
    ...leads.map((lead) => ({
      id: `lead-${lead.id}`,
      description: `Novo lead: ${lead.name}`,
      date: lead.createdAt,
      href: "/crm",
      icon: Handshake,
    })),
    ...movements.map((movement) => {
      const item = stockItemsById[movement.itemId];
      return {
        id: `movement-${movement.id}`,
        description: `${movement.type === "entrada" ? "Entrada" : "Saída"} de estoque: ${item?.name ?? "item"} (${movement.quantity}${item ? ` ${item.unit}` : ""})`,
        date: movement.date,
        href: "/estoque",
        icon: Package,
      };
    }),
  ];

  return items.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)).slice(0, limit);
}

export function formatRelativeDate(dateKey: string, referenceDate: Date) {
  const days = differenceInCalendarDays(referenceDate, new Date(`${dateKey}T00:00:00`));
  if (days <= 0) return "Hoje";
  if (days === 1) return "Ontem";
  return `Há ${days} dias`;
}
