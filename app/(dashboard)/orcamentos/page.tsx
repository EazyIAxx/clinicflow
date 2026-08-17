import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { OrcamentosView } from "@/components/orcamentos/orcamentos-view";
import { mapProfessional } from "@/lib/agenda-types";
import { getCurrentUser } from "@/lib/auth";
import { mapBudget, mapProcedure } from "@/lib/orcamentos-types";
import { mapPatient } from "@/lib/patient-types";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Orçamentos — ClinicFlow",
};

// Validade e indicadores de orçamento dependem da data real de cada acesso,
// não da data do build.
export const dynamic = "force-dynamic";

export default async function OrcamentosPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  const canManage = ["recepcionista", "gestor"].includes(currentUser.role);

  const [budgetRows, procedureRows, patientRows, professionalRows] = await Promise.all([
    prisma.budget.findMany({
      where: { clinicId: currentUser.clinicId },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.procedure.findMany({
      where: { clinicId: currentUser.clinicId },
      orderBy: { name: "asc" },
    }),
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
    <OrcamentosView
      initialBudgets={budgetRows.map(mapBudget)}
      initialProcedures={procedureRows.map(mapProcedure)}
      patients={patientRows.map(mapPatient)}
      professionals={professionalRows.map(mapProfessional)}
      canManage={canManage}
    />
  );
}
