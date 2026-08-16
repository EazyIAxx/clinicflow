import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { PatientProfileView } from "@/components/pacientes/patient-profile-view";
import { mapProfessional } from "@/lib/agenda-types";
import { getCurrentUser } from "@/lib/auth";
import { mapDocument, mapPatient } from "@/lib/patient-types";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const patient = await prisma.patient.findUnique({ where: { id } });

  return {
    title: patient ? `${patient.name} — ClinicFlow` : "Paciente — ClinicFlow",
  };
}

export default async function PatientProfilePage({ params }: PageProps) {
  const { id } = await params;
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  const patientRow = await prisma.patient.findUnique({
    where: { id, clinicId: currentUser.clinicId },
  });
  if (!patientRow) notFound();

  const [documentRows, professionalRows] = await Promise.all([
    prisma.document.findMany({
      where: {
        clinicId: currentUser.clinicId,
        patientId: id,
        ...(currentUser.role === "recepcionista" ? { category: { not: "exame" } } : {}),
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.professional.findMany({
      where: { clinicId: currentUser.clinicId },
      orderBy: { name: "asc" },
    }),
  ]);

  const responsibleProfessional = professionalRows.find(
    (professional) => professional.id === patientRow.responsibleProfessionalId,
  );

  return (
    <PatientProfileView
      initialPatient={mapPatient(patientRow)}
      initialDocuments={documentRows.map(mapDocument)}
      professionals={professionalRows.map(mapProfessional)}
      professionalName={responsibleProfessional?.name}
      referenceDate={new Date()}
    />
  );
}
