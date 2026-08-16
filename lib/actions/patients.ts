"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth";
import { mapPatient, type Patient } from "@/lib/patient-types";
import type { PatientStatus } from "@/lib/patient-status";
import { prisma } from "@/lib/prisma";

export type PatientActionState<T = undefined> = {
  error?: string;
  data?: T;
};

type PatientInput = {
  name: string;
  birthDate: string;
  phone: string;
  email?: string;
  cpf?: string;
  responsibleProfessionalId?: string;
  status: PatientStatus;
  notes?: string;
  healthInsuranceProvider?: string;
  healthInsurancePlan?: string;
  healthInsuranceCardNumber?: string;
  healthInsuranceValidUntil?: string;
};

function validatePatientInput(input: PatientInput): string | undefined {
  if (!input.name.trim() || !input.phone.trim()) {
    return "Preencha nome e telefone.";
  }
  return undefined;
}

export async function createPatient(input: PatientInput): Promise<PatientActionState<Patient>> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { error: "Você não tem permissão para cadastrar pacientes." };
  }

  const validationError = validatePatientInput(input);
  if (validationError) return { error: validationError };

  const row = await prisma.patient.create({
    data: {
      clinicId: currentUser.clinicId,
      name: input.name.trim(),
      birthDate: input.birthDate,
      phone: input.phone.trim(),
      email: input.email || undefined,
      cpf: input.cpf || undefined,
      responsibleProfessionalId: input.responsibleProfessionalId || undefined,
      status: input.status,
      notes: input.notes || undefined,
      healthInsuranceProvider: input.healthInsuranceProvider || undefined,
      healthInsurancePlan: input.healthInsurancePlan || undefined,
      healthInsuranceCardNumber: input.healthInsuranceCardNumber || undefined,
      healthInsuranceValidUntil: input.healthInsuranceValidUntil || undefined,
    },
  });

  revalidatePath("/pacientes");
  return { data: mapPatient(row) };
}

export async function updatePatient(
  id: string,
  input: PatientInput,
): Promise<PatientActionState<Patient>> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { error: "Você não tem permissão para editar pacientes." };
  }

  const validationError = validatePatientInput(input);
  if (validationError) return { error: validationError };

  const row = await prisma.patient.update({
    where: { id, clinicId: currentUser.clinicId },
    data: {
      name: input.name.trim(),
      birthDate: input.birthDate,
      phone: input.phone.trim(),
      email: input.email || null,
      cpf: input.cpf || null,
      responsibleProfessionalId: input.responsibleProfessionalId || null,
      status: input.status,
      notes: input.notes || null,
      healthInsuranceProvider: input.healthInsuranceProvider || null,
      healthInsurancePlan: input.healthInsurancePlan || null,
      healthInsuranceCardNumber: input.healthInsuranceCardNumber || null,
      healthInsuranceValidUntil: input.healthInsuranceValidUntil || null,
    },
  });

  revalidatePath("/pacientes");
  revalidatePath(`/pacientes/${id}`);
  return { data: mapPatient(row) };
}

export async function deletePatient(id: string): Promise<PatientActionState> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { error: "Você não tem permissão para remover pacientes." };
  }

  await prisma.patient.delete({ where: { id, clinicId: currentUser.clinicId } });

  revalidatePath("/pacientes");
  return {};
}
