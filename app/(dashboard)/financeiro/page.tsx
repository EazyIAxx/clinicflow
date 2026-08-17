import { ShieldAlert } from "lucide-react";
import type { Metadata } from "next";

import { FinanceiroView } from "@/components/financeiro/financeiro-view";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { mapCharge, mapExpense } from "@/lib/financeiro-types";
import { mapBudget } from "@/lib/orcamentos-types";
import { mapPatient } from "@/lib/patient-types";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Financeiro — ClinicFlow",
};

// Receita do mês, pendências e inadimplência dependem da data real de cada
// acesso, não da data do build.
export const dynamic = "force-dynamic";

export default async function FinanceiroPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "gestor") {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center gap-2 py-16 text-center">
          <ShieldAlert className="text-muted-foreground size-8" />
          <p className="text-foreground text-sm font-medium">Acesso restrito</p>
          <p className="text-muted-foreground max-w-sm text-sm">
            Só o perfil Gestor/Admin pode acessar o financeiro da clínica.
          </p>
        </CardContent>
      </Card>
    );
  }

  const today = new Date();

  const [chargeRows, expenseRows, patientRows, approvedBudgetRows] = await Promise.all([
    prisma.charge.findMany({
      where: { clinicId: currentUser.clinicId },
      orderBy: { dueDate: "desc" },
    }),
    prisma.expense.findMany({
      where: { clinicId: currentUser.clinicId },
      orderBy: { dueDate: "desc" },
    }),
    prisma.patient.findMany({
      where: { clinicId: currentUser.clinicId },
      orderBy: { name: "asc" },
    }),
    prisma.budget.findMany({
      where: { clinicId: currentUser.clinicId, status: "aprovado" },
      include: { items: true },
    }),
  ]);

  return (
    <FinanceiroView
      initialCharges={chargeRows.map(mapCharge)}
      initialExpenses={expenseRows.map(mapExpense)}
      patients={patientRows.map(mapPatient)}
      approvedBudgets={approvedBudgetRows.map(mapBudget)}
      referenceDate={today}
    />
  );
}
