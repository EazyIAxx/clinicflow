import type { Metadata } from "next";

import { RelatoriosView } from "@/components/relatorios/relatorios-view";
import { getMockAppointments } from "@/lib/mock-agenda";
import { getMockDocuments } from "@/lib/mock-documentos";
import { getMockMovements, getMockStockItems } from "@/lib/mock-estoque";
import { getMockPatients } from "@/lib/mock-pacientes";

export const metadata: Metadata = {
  title: "Relatórios — ClinicFlow",
};

// As métricas ("consultas no mês", "esta semana" etc.) precisam refletir a
// data real de cada acesso, não a do build.
export const dynamic = "force-dynamic";

export default function RelatoriosPage() {
  const today = new Date();

  return (
    <RelatoriosView
      appointments={getMockAppointments(today)}
      items={getMockStockItems(today)}
      movements={getMockMovements(today)}
      patients={getMockPatients(today)}
      documents={getMockDocuments(today)}
      referenceDate={today}
    />
  );
}
