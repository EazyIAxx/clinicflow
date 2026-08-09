import type { Metadata } from "next";

import { CrmView } from "@/components/crm/crm-view";
import { getMockInteractions, getMockLeads } from "@/lib/mock-leads";

export const metadata: Metadata = {
  title: "CRM — ClinicFlow",
};

// Indicadores como "sem retorno há X dias" precisam refletir a data real de
// cada acesso, não a do build.
export const dynamic = "force-dynamic";

export default function CrmPage() {
  const today = new Date();

  return (
    <CrmView
      initialLeads={getMockLeads(today)}
      initialInteractions={getMockInteractions(today)}
      referenceDate={today}
    />
  );
}
