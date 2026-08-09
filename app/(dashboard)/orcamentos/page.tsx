import type { Metadata } from "next";

import { OrcamentosView } from "@/components/orcamentos/orcamentos-view";
import { getMockBudgets } from "@/lib/mock-orcamentos";
import { getMockPatients } from "@/lib/mock-pacientes";
import { getMockProcedures } from "@/lib/mock-procedimentos";

export const metadata: Metadata = {
  title: "Orçamentos — ClinicFlow",
};

// Validade e indicadores de orçamento dependem da data real de cada acesso,
// não da data do build.
export const dynamic = "force-dynamic";

export default function OrcamentosPage() {
  const today = new Date();

  return (
    <OrcamentosView
      initialBudgets={getMockBudgets(today)}
      initialProcedures={getMockProcedures()}
      patients={getMockPatients(today)}
    />
  );
}
