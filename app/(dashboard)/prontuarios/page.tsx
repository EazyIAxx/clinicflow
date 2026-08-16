import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ProntuariosView } from "@/components/prontuarios/prontuarios-view";
import { getCurrentUser } from "@/lib/auth";
import { mapDocument, mapPatient } from "@/lib/patient-types";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Prontuários — ClinicFlow",
};

// "Adicionados esta semana" precisa refletir a data real de cada acesso, não
// a do build.
export const dynamic = "force-dynamic";

export default async function ProntuariosPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  const [documentRows, patientRows] = await Promise.all([
    prisma.document.findMany({
      where: {
        clinicId: currentUser.clinicId,
        ...(currentUser.role === "recepcionista" ? { category: { not: "exame" } } : {}),
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.patient.findMany({
      where: { clinicId: currentUser.clinicId },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <ProntuariosView
      initialDocuments={documentRows.map(mapDocument)}
      patients={patientRows.map(mapPatient)}
      referenceDate={new Date()}
    />
  );
}
