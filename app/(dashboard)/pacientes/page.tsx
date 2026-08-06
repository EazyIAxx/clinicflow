import type { Metadata } from "next";

import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export const metadata: Metadata = {
  title: "Pacientes — ClinicFlow",
};

export default function PacientesPage() {
  return (
    <ModulePlaceholder
      title="Pacientes"
      description="Cadastro, busca e histórico dos pacientes atendidos pela clínica."
      milestone="M4"
      stats={[
        { label: "Pacientes cadastrados", value: "342" },
        { label: "Novos este mês", value: "19" },
      ]}
    />
  );
}
