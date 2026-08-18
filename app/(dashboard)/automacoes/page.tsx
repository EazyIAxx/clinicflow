import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AutomacoesView } from "@/components/automacoes/automacoes-view";
import { mapProfessional } from "@/lib/agenda-types";
import { mapAutomationRule } from "@/lib/automacao-types";
import { getCurrentUser } from "@/lib/auth";
import { mapStockItem } from "@/lib/estoque-types";
import { computeBudgetTotals } from "@/lib/orcamentos-types";
import { mapPatient } from "@/lib/patient-types";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Automações — ClinicFlow",
};

// Elegibilidade de gatilho (aniversário, dias após consulta etc.) depende da
// data real de cada acesso, não da data do build.
export const dynamic = "force-dynamic";

export default async function AutomacoesPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  const canManage = ["recepcionista", "gestor"].includes(currentUser.role);

  const [ruleRows, patientRows, professionalRows, stockItemRows, appointmentRows, budgetRows] =
    await Promise.all([
      prisma.automationRule.findMany({
        where: { clinicId: currentUser.clinicId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.patient.findMany({ where: { clinicId: currentUser.clinicId }, orderBy: { name: "asc" } }),
      prisma.professional.findMany({
        where: { clinicId: currentUser.clinicId, active: true },
        orderBy: { name: "asc" },
      }),
      prisma.stockItem.findMany({ where: { clinicId: currentUser.clinicId } }),
      prisma.appointment.findMany({ where: { clinicId: currentUser.clinicId } }),
      prisma.budget.findMany({ where: { clinicId: currentUser.clinicId }, include: { items: true } }),
    ]);

  return (
    <AutomacoesView
      initialRules={ruleRows.map(mapAutomationRule)}
      patients={patientRows.map(mapPatient)}
      professionals={professionalRows.map(mapProfessional)}
      stockItems={stockItemRows.map(mapStockItem)}
      appointments={appointmentRows.map((row) => ({
        patientName: row.patientName ?? undefined,
        date: row.date,
        startTime: row.startTime,
        status: row.status,
        professionalId: row.professionalId,
      }))}
      budgets={budgetRows.map((row) => ({
        patientId: row.patientId,
        status: row.status,
        total: computeBudgetTotals({
          items: row.items.map((item) => ({
            id: item.id,
            procedureId: item.procedureId,
            amount: Number(item.amount),
          })),
          discountPercent: Number(row.discountPercent),
        }).total,
      }))}
      canManage={canManage}
    />
  );
}
