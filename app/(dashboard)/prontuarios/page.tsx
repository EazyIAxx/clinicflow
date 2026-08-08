import type { Metadata } from "next";

import { ProntuariosView } from "@/components/prontuarios/prontuarios-view";
import { getMockDocuments } from "@/lib/mock-documentos";
import { getMockPatients } from "@/lib/mock-pacientes";

export const metadata: Metadata = {
  title: "Prontuários — ClinicFlow",
};

// "Adicionados esta semana" precisa refletir a data real de cada acesso, não
// a do build.
export const dynamic = "force-dynamic";

export default function ProntuariosPage() {
  const today = new Date();
  const documents = getMockDocuments(today);
  const patients = getMockPatients(today);

  return <ProntuariosView initialDocuments={documents} patients={patients} referenceDate={today} />;
}
