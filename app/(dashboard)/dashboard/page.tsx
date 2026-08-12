import type { Metadata } from "next";

import { DashboardHomeView } from "@/components/dashboard-home/dashboard-home-view";
import { getMockAppointments, professionals } from "@/lib/mock-agenda";
import { getMockMovements, getMockStockItems } from "@/lib/mock-estoque";
import { getMockInteractions, getMockLeads } from "@/lib/mock-leads";
import { getMockBudgets } from "@/lib/mock-orcamentos";
import { getMockPatients } from "@/lib/mock-pacientes";

export const metadata: Metadata = {
  title: "Visão geral — ClinicFlow",
};

// Agenda de hoje, pendências e atividade recente dependem da data real de
// cada acesso, não da data do build.
export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const today = new Date();

  return (
    <DashboardHomeView
      appointments={getMockAppointments(today)}
      professionals={professionals}
      patients={getMockPatients(today)}
      budgets={getMockBudgets(today)}
      stockItems={getMockStockItems(today)}
      movements={getMockMovements(today)}
      leads={getMockLeads(today)}
      interactions={getMockInteractions(today)}
      referenceDate={today}
    />
  );
}
