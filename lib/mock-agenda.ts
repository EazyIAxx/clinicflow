import { addDays, format, startOfWeek } from "date-fns";

import type { AppointmentStatus } from "@/lib/agenda-status";

export type Professional = {
  id: string;
  name: string;
  role: string;
  room: string;
  initials: string;
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

export const professionals: Professional[] = [
  {
    id: "prof-1",
    name: "Dra. Camila Rocha",
    role: "Clínica Geral",
    room: "Consultório 1",
    initials: "CR",
  },
  {
    id: "prof-2",
    name: "Dr. Rafael Nunes",
    role: "Ortodontia",
    room: "Consultório 2",
    initials: "RN",
  },
  {
    id: "prof-3",
    name: "Dra. Beatriz Lima",
    role: "Dermatologia",
    room: "Consultório 3",
    initials: "BL",
  },
  {
    id: "prof-4",
    name: "Dr. Thiago Alves",
    role: "Fisioterapia",
    room: "Sala de Procedimentos",
    initials: "TA",
  },
  {
    id: "prof-5",
    name: "Dra. Juliana Costa",
    role: "Nutrição",
    room: "Consultório 4",
    initials: "JC",
  },
];

const dateKey = (date: Date) => format(date, "yyyy-MM-dd");

/**
 * Gera consultas mockadas ancoradas em `referenceDate`, para que "hoje" nunca
 * fique vazio independente de quando a página é aberta.
 */
export function getMockAppointments(referenceDate: Date): Appointment[] {
  const today = dateKey(referenceDate);
  const weekStart = startOfWeek(referenceDate, { weekStartsOn: 1 });
  const atWeekday = (offset: number) => dateKey(addDays(weekStart, offset));

  const appointments: Appointment[] = [
    // Hoje
    {
      id: "apt-1",
      professionalId: "prof-1",
      date: today,
      startTime: "08:30",
      durationMinutes: 30,
      status: "confirmada",
      kind: "consulta",
      patientName: "Marina Alves",
      service: "Consulta de rotina",
    },
    {
      id: "apt-2",
      professionalId: "prof-1",
      date: today,
      startTime: "09:30",
      durationMinutes: 30,
      status: "pendente",
      kind: "consulta",
      patientName: "Eduardo Prado",
      service: "Retorno",
    },
    {
      id: "apt-3",
      professionalId: "prof-1",
      date: today,
      startTime: "14:00",
      durationMinutes: 60,
      status: "confirmada",
      kind: "consulta",
      patientName: "Sofia Martins",
      service: "Avaliação inicial",
    },
    {
      id: "apt-4",
      professionalId: "prof-2",
      date: today,
      startTime: "09:00",
      durationMinutes: 60,
      status: "confirmada",
      kind: "consulta",
      patientName: "Lucas Ferreira",
      service: "Manutenção de aparelho",
    },
    {
      id: "apt-5",
      professionalId: "prof-2",
      date: today,
      startTime: "10:30",
      durationMinutes: 30,
      status: "cancelada",
      kind: "consulta",
      patientName: "Helena Dias",
      service: "Avaliação ortodôntica",
    },
    {
      id: "apt-6",
      professionalId: "prof-3",
      date: today,
      startTime: "10:00",
      durationMinutes: 30,
      status: "pendente",
      kind: "consulta",
      patientName: "Rafaela Souza",
      service: "Consulta dermatológica",
    },
    {
      id: "apt-7",
      professionalId: "prof-3",
      date: today,
      startTime: "15:30",
      durationMinutes: 30,
      status: "remarcada",
      kind: "consulta",
      patientName: "Gabriel Torres",
      service: "Retorno",
      rescheduledFrom: { date: today, startTime: "13:00" },
    },
    {
      id: "apt-8",
      professionalId: "prof-4",
      date: today,
      startTime: "08:00",
      durationMinutes: 60,
      status: "confirmada",
      kind: "consulta",
      patientName: "Isabela Ramos",
      service: "Sessão de fisioterapia",
    },
    {
      id: "apt-9",
      professionalId: "prof-5",
      date: today,
      startTime: "11:00",
      durationMinutes: 30,
      status: "confirmada",
      kind: "consulta",
      patientName: "Pedro Henrique",
      service: "Acompanhamento nutricional",
    },

    // Ao longo da semana, para a visão semanal ter variedade
    {
      id: "apt-10",
      professionalId: "prof-1",
      date: atWeekday(0),
      startTime: "16:00",
      durationMinutes: 30,
      status: "cancelada",
      kind: "consulta",
      patientName: "André Melo",
      service: "Consulta de rotina",
    },
    {
      id: "apt-11",
      professionalId: "prof-2",
      date: atWeekday(1),
      startTime: "11:30",
      durationMinutes: 30,
      status: "remarcada",
      kind: "consulta",
      patientName: "Carla Nogueira",
      service: "Manutenção de aparelho",
      rescheduledFrom: { date: atWeekday(0), startTime: "09:00" },
    },
    {
      id: "apt-12",
      professionalId: "prof-3",
      date: atWeekday(2),
      startTime: "09:30",
      durationMinutes: 30,
      status: "pendente",
      kind: "consulta",
      patientName: "Fernanda Reis",
      service: "Consulta dermatológica",
    },
    {
      id: "apt-13",
      professionalId: "prof-4",
      date: atWeekday(3),
      startTime: "14:30",
      durationMinutes: 60,
      status: "confirmada",
      kind: "consulta",
      patientName: "Otávio Barros",
      service: "Sessão de fisioterapia",
    },
    {
      id: "apt-14",
      professionalId: "prof-5",
      date: atWeekday(4),
      startTime: "10:00",
      durationMinutes: 30,
      status: "cancelada",
      kind: "consulta",
      patientName: "Renata Vieira",
      service: "Acompanhamento nutricional",
    },
  ];

  // Bloqueio recorrente de almoço (12:00–13:00), seg a sex, para todos os profissionais
  for (let day = 0; day < 5; day++) {
    for (const professional of professionals) {
      appointments.push({
        id: `block-lunch-${day}-${professional.id}`,
        professionalId: professional.id,
        date: atWeekday(day),
        startTime: "12:00",
        durationMinutes: 60,
        status: "bloqueio",
        kind: "bloqueio",
        reason: "Almoço",
      });
    }
  }

  // Bloqueio maior pontual
  appointments.push({
    id: "block-team-meeting",
    professionalId: "prof-1",
    date: atWeekday(2),
    startTime: "15:00",
    durationMinutes: 90,
    status: "bloqueio",
    kind: "bloqueio",
    reason: "Reunião de equipe",
  });

  return appointments;
}
