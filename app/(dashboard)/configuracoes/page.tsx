import type { Metadata } from "next";

import { ConfiguracoesView } from "@/components/configuracoes/configuracoes-view";
import { getMockUsers } from "@/lib/mock-usuarios";

export const metadata: Metadata = {
  title: "Configurações — ClinicFlow",
};

export default function ConfiguracoesPage() {
  return <ConfiguracoesView initialUsers={getMockUsers()} />;
}
