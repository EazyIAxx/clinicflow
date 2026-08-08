import type { Metadata } from "next";

import { PacientesView } from "@/components/pacientes/pacientes-view";
import { getMockPatients } from "@/lib/mock-pacientes";

export const metadata: Metadata = {
  title: "Pacientes — ClinicFlow",
};

// "Novos este mês" e "última visita" precisam refletir a data real de cada
// acesso, não a do build.
export const dynamic = "force-dynamic";

export default function PacientesPage() {
  const today = new Date();
  const patients = getMockPatients(today);

  return <PacientesView initialPatients={patients} referenceDate={today} />;
}
