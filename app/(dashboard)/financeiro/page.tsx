import type { Metadata } from "next";

import { FinanceiroView } from "@/components/financeiro/financeiro-view";
import { getMockCharges, getMockExpenses } from "@/lib/mock-financeiro";
import { getMockPatients } from "@/lib/mock-pacientes";

export const metadata: Metadata = {
  title: "Financeiro — ClinicFlow",
};

// Receita do mês, pendências e inadimplência dependem da data real de cada
// acesso, não da data do build.
export const dynamic = "force-dynamic";

export default function FinanceiroPage() {
  const today = new Date();

  return (
    <FinanceiroView
      initialCharges={getMockCharges(today)}
      initialExpenses={getMockExpenses(today)}
      patients={getMockPatients(today)}
      referenceDate={today}
    />
  );
}
