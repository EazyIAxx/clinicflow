import {
  differenceInCalendarDays,
  eachDayOfInterval,
  format,
  isSameMonth,
  subDays,
} from "date-fns";
import { ptBR } from "date-fns/locale";

import type { AppointmentStatus } from "@/lib/agenda-status";
import type { Appointment } from "@/lib/agenda-types";
import { categoryLabels, type StockCategory, type StockItem, type StockMovement } from "@/lib/estoque-types";
import type { Patient, PatientDocument } from "@/lib/patient-types";
import { getStockFlags } from "@/lib/stock-status";

const parseDate = (date: string) => new Date(`${date}T00:00:00`);

export function getAppointmentStatusBreakdown(appointments: Appointment[]) {
  const consultas = appointments.filter((appointment) => appointment.kind === "consulta");
  const order: AppointmentStatus[] = ["pendente", "confirmada", "remarcada", "cancelada"];

  return order.map((status) => ({
    status,
    count: consultas.filter((appointment) => appointment.status === status).length,
  }));
}

export function getConfirmationRate(appointments: Appointment[]) {
  const consultas = appointments.filter((appointment) => appointment.kind === "consulta");
  if (consultas.length === 0) return 0;

  const confirmadas = consultas.filter((appointment) => appointment.status === "confirmada").length;
  return Math.round((confirmadas / consultas.length) * 100);
}

export function getMovementsTrend(movements: StockMovement[], referenceDate: Date, days: number) {
  const interval = eachDayOfInterval({
    start: subDays(referenceDate, days - 1),
    end: referenceDate,
  });

  return interval.map((day) => {
    const dateKey = format(day, "yyyy-MM-dd");
    const dayMovements = movements.filter((movement) => movement.date === dateKey);

    return {
      date: dateKey,
      label: format(day, "dd/MM", { locale: ptBR }),
      entrada: dayMovements
        .filter((movement) => movement.type === "entrada")
        .reduce((sum, movement) => sum + movement.quantity, 0),
      saida: dayMovements
        .filter((movement) => movement.type === "saida")
        .reduce((sum, movement) => sum + movement.quantity, 0),
    };
  });
}

export function getStockCategoryBreakdown(items: StockItem[]) {
  const categories = Object.keys(categoryLabels) as StockCategory[];

  return categories
    .map((category) => ({
      category,
      label: categoryLabels[category],
      count: items.filter((item) => item.category === category).length,
    }))
    .sort((a, b) => b.count - a.count);
}

export function getReportStats({
  appointments,
  items,
  documents,
  patients,
  referenceDate,
}: {
  appointments: Appointment[];
  items: StockItem[];
  documents: PatientDocument[];
  patients: Patient[];
  referenceDate: Date;
}) {
  const appointmentsThisMonth = appointments.filter(
    (appointment) =>
      appointment.kind === "consulta" && isSameMonth(parseDate(appointment.date), referenceDate),
  ).length;

  const lowStockCount = items.filter((item) =>
    getStockFlags({
      quantity: item.quantity,
      minQuantity: item.minQuantity,
      expiresAt: item.expiresAt,
      referenceDate,
    }).includes("baixo"),
  ).length;

  const expiringCount = items.filter((item) => {
    const flags = getStockFlags({
      quantity: item.quantity,
      minQuantity: item.minQuantity,
      expiresAt: item.expiresAt,
      referenceDate,
    });
    return flags.includes("vencendo") || flags.includes("vencido");
  }).length;

  const documentsThisWeek = documents.filter((document) => {
    const days = differenceInCalendarDays(referenceDate, parseDate(document.uploadedAt));
    return days >= 0 && days <= 6;
  }).length;

  const activePatients = patients.filter((patient) => patient.status === "ativo").length;

  return {
    appointmentsThisMonth,
    confirmationRate: getConfirmationRate(appointments),
    lowStockCount,
    expiringCount,
    documentsThisWeek,
    activePatients,
  };
}
