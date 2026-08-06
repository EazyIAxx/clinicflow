import type { Metadata } from "next";

import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export const metadata: Metadata = {
  title: "Configurações — ClinicFlow",
};

export default function ConfiguracoesPage() {
  return (
    <ModulePlaceholder
      title="Configurações"
      description="Dados da clínica, usuários, permissões por perfil e preferências do sistema."
      milestone="M5"
      stats={[{ label: "Usuários ativos", value: "4" }]}
    />
  );
}
