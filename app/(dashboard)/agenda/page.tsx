import type { Metadata } from "next";

import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export const metadata: Metadata = {
  title: "Agenda — ClinicFlow",
};

export default function AgendaPage() {
  return (
    <ModulePlaceholder
      title="Agenda"
      description="Calendário por profissional/sala, confirmação, remarcação e cancelamento de consultas."
      milestone="M2"
      stats={[
        { label: "Consultas hoje", value: "8" },
        { label: "Aguardando confirmação", value: "3" },
        { label: "Profissionais ativos", value: "5" },
      ]}
    />
  );
}
