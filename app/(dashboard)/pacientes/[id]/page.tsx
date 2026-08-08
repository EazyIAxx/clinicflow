import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PatientProfileView } from "@/components/pacientes/patient-profile-view";
import { getMockDocuments } from "@/lib/mock-documentos";
import { getMockPatients } from "@/lib/mock-pacientes";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const patient = getMockPatients(new Date()).find((candidate) => candidate.id === id);

  return {
    title: patient ? `${patient.name} — ClinicFlow` : "Paciente — ClinicFlow",
  };
}

export default async function PatientProfilePage({ params }: PageProps) {
  const { id } = await params;
  const today = new Date();
  const patient = getMockPatients(today).find((candidate) => candidate.id === id);

  if (!patient) {
    notFound();
  }

  const documents = getMockDocuments(today).filter((document) => document.patientId === id);

  return <PatientProfileView initialPatient={patient} initialDocuments={documents} referenceDate={today} />;
}
