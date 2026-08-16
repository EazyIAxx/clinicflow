import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PacientesView } from "@/components/pacientes/pacientes-view";
import { mapProfessional } from "@/lib/agenda-types";
import { getCurrentUser } from "@/lib/auth";
import { mapPatient } from "@/lib/patient-types";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Pacientes — ClinicFlow",
};

// "Novos este mês" e "última visita" precisam refletir a data real de cada
// acesso, não a do build.
export const dynamic = "force-dynamic";

export default async function PacientesPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  const today = new Date();

  const [patientRows, professionalRows] = await Promise.all([
    prisma.patient.findMany({
      where: { clinicId: currentUser.clinicId },
      orderBy: { name: "asc" },
    }),
    prisma.professional.findMany({
      where: { clinicId: currentUser.clinicId, active: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <PacientesView
      initialPatients={patientRows.map(mapPatient)}
      professionals={professionalRows.map(mapProfessional)}
      referenceDate={today}
    />
  );
}
