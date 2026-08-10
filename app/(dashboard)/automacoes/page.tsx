import type { Metadata } from "next";

import { AutomacoesView } from "@/components/automacoes/automacoes-view";
import { getMockAutomationRules } from "@/lib/mock-automacoes";
import { getMockPatients } from "@/lib/mock-pacientes";

export const metadata: Metadata = {
  title: "Automações — ClinicFlow",
};

// Datas de criação/último disparo das regras são ancoradas na data real de
// cada acesso, não na data do build.
export const dynamic = "force-dynamic";

export default function AutomacoesPage() {
  const today = new Date();

  return (
    <AutomacoesView
      initialRules={getMockAutomationRules(today)}
      patients={getMockPatients(today)}
    />
  );
}
