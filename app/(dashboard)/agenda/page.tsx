import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AgendaView } from "@/components/agenda/agenda-view";
import { mapAppointment, mapProfessional } from "@/lib/agenda-types";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Agenda — ClinicFlow",
};

// "Hoje" precisa refletir a data real de cada acesso, não a data do build.
export const dynamic = "force-dynamic";

export default async function AgendaPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  const today = new Date();
  const canManage = ["recepcionista", "gestor"].includes(currentUser.role);

  const [professionalRows, appointmentRows] = await Promise.all([
    prisma.professional.findMany({
      where: { clinicId: currentUser.clinicId, active: true },
      orderBy: { name: "asc" },
    }),
    prisma.appointment.findMany({
      where: { clinicId: currentUser.clinicId },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    }),
  ]);

  return (
    <AgendaView
      professionals={professionalRows.map(mapProfessional)}
      initialAppointments={appointmentRows.map(mapAppointment)}
      today={today}
      canManage={canManage}
    />
  );
}
