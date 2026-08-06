import type { Metadata } from "next";

import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export const metadata: Metadata = {
  title: "Relatórios — ClinicFlow",
};

export default function RelatoriosPage() {
  return (
    <ModulePlaceholder
      title="Relatórios"
      description="Métricas consolidadas de agenda e estoque, com exportação de dados."
      milestone="M5"
      stats={[{ label: "Relatórios gerados este mês", value: "12" }]}
    />
  );
}
