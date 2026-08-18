import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { DashboardHomeView } from "@/components/dashboard-home/dashboard-home-view";
import { mapAppointment, mapProfessional } from "@/lib/agenda-types";
import { getCurrentUser } from "@/lib/auth";
import { mapInteraction, mapLead } from "@/lib/crm-types";
import { mapStockItem, mapStockMovement } from "@/lib/estoque-types";
import { mapBudget } from "@/lib/orcamentos-types";
import { mapPatient } from "@/lib/patient-types";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Visão geral — ClinicFlow",
};

// Agenda de hoje, pendências e atividade recente dependem da data real de
// cada acesso, não da data do build.
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  const today = new Date();

  const [
    appointmentRows,
    professionalRows,
    patientRows,
    budgetRows,
    stockItemRows,
    movementRows,
    leadRows,
    interactionRows,
  ] = await Promise.all([
    prisma.appointment.findMany({ where: { clinicId: currentUser.clinicId } }),
    prisma.professional.findMany({ where: { clinicId: currentUser.clinicId } }),
    prisma.patient.findMany({ where: { clinicId: currentUser.clinicId } }),
    prisma.budget.findMany({ where: { clinicId: currentUser.clinicId }, include: { items: true } }),
    prisma.stockItem.findMany({ where: { clinicId: currentUser.clinicId } }),
    prisma.stockMovement.findMany({ where: { clinicId: currentUser.clinicId } }),
    prisma.lead.findMany({ where: { clinicId: currentUser.clinicId } }),
    prisma.leadInteraction.findMany({ where: { clinicId: currentUser.clinicId } }),
  ]);

  return (
    <DashboardHomeView
      appointments={appointmentRows.map(mapAppointment)}
      professionals={professionalRows.map(mapProfessional)}
      patients={patientRows.map(mapPatient)}
      budgets={budgetRows.map(mapBudget)}
      stockItems={stockItemRows.map(mapStockItem)}
      movements={movementRows.map(mapStockMovement)}
      leads={leadRows.map(mapLead)}
      interactions={interactionRows.map(mapInteraction)}
      referenceDate={today}
    />
  );
}
