import type { Metadata } from "next";

import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export const metadata: Metadata = {
  title: "Estoque — ClinicFlow",
};

export default function EstoquePage() {
  return (
    <ModulePlaceholder
      title="Estoque"
      description="Controle de materiais e medicamentos: entradas, saídas, validade e alerta de estoque mínimo."
      milestone="M3"
      stats={[
        { label: "Itens cadastrados", value: "128" },
        { label: "Abaixo do mínimo", value: "6" },
        { label: "Vencendo em 30 dias", value: "4" },
      ]}
    />
  );
}
