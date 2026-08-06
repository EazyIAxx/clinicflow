import type { Metadata } from "next";

import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export const metadata: Metadata = {
  title: "Prontuários — ClinicFlow",
};

export default function ProntuariosPage() {
  return (
    <ModulePlaceholder
      title="Prontuários"
      description="Upload e organização de exames, receitas e documentos por paciente."
      milestone="M4"
      stats={[
        { label: "Documentos armazenados", value: "876" },
        { label: "Adicionados esta semana", value: "27" },
      ]}
    />
  );
}
