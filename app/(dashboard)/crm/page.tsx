import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { CrmView } from "@/components/crm/crm-view";
import { mapProfessional } from "@/lib/agenda-types";
import { getCurrentUser } from "@/lib/auth";
import { mapInteraction, mapLead } from "@/lib/crm-types";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "CRM — ClinicFlow",
};

// Indicadores como "sem retorno há X dias" precisam refletir a data real de
// cada acesso, não a do build.
export const dynamic = "force-dynamic";

export default async function CrmPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  const today = new Date();

  const [leadRows, interactionRows, professionalRows] = await Promise.all([
    prisma.lead.findMany({
      where: { clinicId: currentUser.clinicId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.leadInteraction.findMany({ where: { clinicId: currentUser.clinicId } }),
    prisma.professional.findMany({
      where: { clinicId: currentUser.clinicId, active: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <CrmView
      initialLeads={leadRows.map(mapLead)}
      initialInteractions={interactionRows.map(mapInteraction)}
      professionals={professionalRows.map(mapProfessional)}
      referenceDate={today}
    />
  );
}
