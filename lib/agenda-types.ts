import type { AppointmentStatus } from "@/lib/agenda-status";
import type {
  Appointment as AppointmentRow,
  Professional as ProfessionalRow,
} from "@/lib/generated/prisma/client";

export type Professional = {
  id: string;
  name: string;
  specialty: string;
  room: string;
  licenseNumber?: string;
  initials: string;
  active: boolean;
};

export type Appointment = {
  id: string;
  professionalId: string;
  date: string; // yyyy-MM-dd
  startTime: string; // HH:mm
  durationMinutes: 30 | 60 | 90;
  status: AppointmentStatus;
  kind: "consulta" | "bloqueio";
  patientName?: string;
  service?: string;
  reason?: string;
  notes?: string;
  rescheduledFrom?: { date: string; startTime: string };
};

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function mapProfessional(row: ProfessionalRow): Professional {
  return {
    id: row.id,
    name: row.name,
    specialty: row.specialty,
    room: row.room,
    licenseNumber: row.licenseNumber ?? undefined,
    initials: getInitials(row.name),
    active: row.active,
  };
}

export function mapAppointment(row: AppointmentRow): Appointment {
  return {
    id: row.id,
    professionalId: row.professionalId,
    date: row.date,
    startTime: row.startTime,
    durationMinutes: row.durationMinutes as 30 | 60 | 90,
    status: row.status,
    kind: row.kind,
    patientName: row.patientName ?? undefined,
    service: row.service ?? undefined,
    reason: row.reason ?? undefined,
    notes: row.notes ?? undefined,
    rescheduledFrom:
      row.rescheduledFromDate && row.rescheduledFromTime
        ? { date: row.rescheduledFromDate, startTime: row.rescheduledFromTime }
        : undefined,
  };
}
