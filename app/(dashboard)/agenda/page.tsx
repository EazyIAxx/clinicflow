import type { Metadata } from "next";

import { AgendaView } from "@/components/agenda/agenda-view";
import { getMockAppointments, professionals } from "@/lib/mock-agenda";

export const metadata: Metadata = {
  title: "Agenda — ClinicFlow",
};

// "Hoje" precisa refletir a data real de cada acesso, não a data do build.
export const dynamic = "force-dynamic";

export default function AgendaPage() {
  const today = new Date();
  const appointments = getMockAppointments(today);

  return (
    <AgendaView professionals={professionals} initialAppointments={appointments} today={today} />
  );
}
