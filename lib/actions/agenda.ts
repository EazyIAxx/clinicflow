"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth";
import {
  mapAppointment,
  mapProfessional,
  type Appointment,
  type Professional,
} from "@/lib/agenda-types";
import { prisma } from "@/lib/prisma";

export type AgendaActionState<T> = {
  error?: string;
  data?: T;
};

async function requireAgendaManager() {
  const currentUser = await getCurrentUser();
  if (!currentUser || !["recepcionista", "gestor"].includes(currentUser.role)) {
    return null;
  }
  return currentUser;
}

function timeToMinutes(time: string): number {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

async function hasConflict(
  clinicId: string,
  professionalId: string,
  date: string,
  startTime: string,
  durationMinutes: number,
  excludeId?: string,
): Promise<boolean> {
  const sameDay = await prisma.appointment.findMany({
    where: {
      clinicId,
      professionalId,
      date,
      status: { not: "cancelada" },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  });

  const newStart = timeToMinutes(startTime);
  const newEnd = newStart + durationMinutes;

  return sameDay.some((appointment) => {
    const start = timeToMinutes(appointment.startTime);
    const end = start + appointment.durationMinutes;
    return newStart < end && start < newEnd;
  });
}

export async function createAppointment(input: {
  professionalId: string;
  date: string;
  startTime: string;
  durationMinutes: number;
  kind: "consulta" | "bloqueio";
  patientName?: string;
  service?: string;
  reason?: string;
  notes?: string;
}): Promise<AgendaActionState<Appointment>> {
  const currentUser = await requireAgendaManager();
  if (!currentUser) {
    return { error: "Você não tem permissão para criar agendamentos." };
  }

  const conflict = await hasConflict(
    currentUser.clinicId,
    input.professionalId,
    input.date,
    input.startTime,
    input.durationMinutes,
  );
  if (conflict) {
    return { error: "Já existe um agendamento ou bloqueio nesse horário para esse profissional." };
  }

  const row = await prisma.appointment.create({
    data: {
      clinicId: currentUser.clinicId,
      professionalId: input.professionalId,
      date: input.date,
      startTime: input.startTime,
      durationMinutes: input.durationMinutes,
      status: input.kind === "consulta" ? "confirmada" : "bloqueio",
      kind: input.kind,
      patientName: input.kind === "consulta" ? input.patientName : undefined,
      service: input.kind === "consulta" ? input.service : undefined,
      reason: input.kind === "bloqueio" ? input.reason || "Bloqueio" : undefined,
      notes: input.kind === "consulta" ? input.notes : undefined,
    },
  });

  revalidatePath("/agenda");
  return { data: mapAppointment(row) };
}

export async function confirmAppointment(id: string): Promise<AgendaActionState<Appointment>> {
  const currentUser = await requireAgendaManager();
  if (!currentUser) {
    return { error: "Você não tem permissão para confirmar agendamentos." };
  }

  const row = await prisma.appointment.update({
    where: { id, clinicId: currentUser.clinicId },
    data: { status: "confirmada" },
  });

  revalidatePath("/agenda");
  return { data: mapAppointment(row) };
}

export async function cancelAppointment(id: string): Promise<AgendaActionState<Appointment>> {
  const currentUser = await requireAgendaManager();
  if (!currentUser) {
    return { error: "Você não tem permissão para cancelar agendamentos." };
  }

  const row = await prisma.appointment.update({
    where: { id, clinicId: currentUser.clinicId },
    data: { status: "cancelada" },
  });

  revalidatePath("/agenda");
  return { data: mapAppointment(row) };
}

export async function rescheduleAppointment(
  id: string,
  date: string,
  startTime: string,
): Promise<AgendaActionState<Appointment>> {
  const currentUser = await requireAgendaManager();
  if (!currentUser) {
    return { error: "Você não tem permissão para remarcar agendamentos." };
  }

  const existing = await prisma.appointment.findUnique({
    where: { id, clinicId: currentUser.clinicId },
  });
  if (!existing) {
    return { error: "Agendamento não encontrado." };
  }

  const conflict = await hasConflict(
    currentUser.clinicId,
    existing.professionalId,
    date,
    startTime,
    existing.durationMinutes,
    id,
  );
  if (conflict) {
    return { error: "Já existe um agendamento ou bloqueio nesse horário para esse profissional." };
  }

  const row = await prisma.appointment.update({
    where: { id, clinicId: currentUser.clinicId },
    data: {
      status: "remarcada",
      rescheduledFromDate: existing.date,
      rescheduledFromTime: existing.startTime,
      date,
      startTime,
    },
  });

  revalidatePath("/agenda");
  return { data: mapAppointment(row) };
}

export async function removeBlock(id: string): Promise<AgendaActionState<null>> {
  const currentUser = await requireAgendaManager();
  if (!currentUser) {
    return { error: "Você não tem permissão para remover bloqueios." };
  }

  await prisma.appointment.delete({
    where: { id, clinicId: currentUser.clinicId, kind: "bloqueio" },
  });

  revalidatePath("/agenda");
  return { data: null };
}

export async function createProfessional(input: {
  name: string;
  specialty: string;
  room: string;
}): Promise<AgendaActionState<Professional>> {
  const currentUser = await requireAgendaManager();
  if (!currentUser) {
    return { error: "Você não tem permissão para cadastrar profissionais." };
  }

  const name = input.name.trim();
  const specialty = input.specialty.trim();
  const room = input.room.trim();
  if (!name || !specialty || !room) {
    return { error: "Preencha nome, especialidade e sala." };
  }

  const row = await prisma.professional.create({
    data: { clinicId: currentUser.clinicId, name, specialty, room },
  });

  revalidatePath("/agenda");
  return { data: mapProfessional(row) };
}

export async function setProfessionalActive(
  id: string,
  active: boolean,
): Promise<AgendaActionState<Professional>> {
  const currentUser = await requireAgendaManager();
  if (!currentUser) {
    return { error: "Você não tem permissão para gerenciar profissionais." };
  }

  const row = await prisma.professional.update({
    where: { id, clinicId: currentUser.clinicId },
    data: { active },
  });

  revalidatePath("/agenda");
  return { data: mapProfessional(row) };
}
