"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth";
import {
  mapInteraction,
  mapLead,
  originToPrisma,
  type Interaction,
  type InteractionType,
  type Lead,
  type LeadOrigin,
} from "@/lib/crm-types";
import type { LeadStage } from "@/lib/lead-status";
import { mapPatient } from "@/lib/patient-types";
import { prisma } from "@/lib/prisma";

export type CrmActionState<T = undefined> = {
  error?: string;
  data?: T;
};

type LeadInput = {
  name: string;
  phone: string;
  email?: string;
  origin: LeadOrigin;
  interest: string;
  responsibleProfessionalId?: string;
  stage: LeadStage;
  notes?: string;
};

function validateLeadInput(input: LeadInput): string | undefined {
  if (!input.name.trim() || !input.phone.trim() || !input.interest.trim()) {
    return "Preencha nome, telefone e interesse.";
  }
  return undefined;
}

export async function createLead(input: LeadInput): Promise<CrmActionState<Lead>> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { error: "Você não tem permissão para cadastrar leads." };
  }

  const validationError = validateLeadInput(input);
  if (validationError) return { error: validationError };

  const row = await prisma.lead.create({
    data: {
      clinicId: currentUser.clinicId,
      name: input.name.trim(),
      phone: input.phone.trim(),
      email: input.email || undefined,
      origin: originToPrisma(input.origin),
      interest: input.interest.trim(),
      responsibleProfessionalId: input.responsibleProfessionalId || undefined,
      stage: input.stage,
      notes: input.notes || undefined,
    },
  });

  revalidatePath("/crm");
  return { data: mapLead(row) };
}

export async function updateLead(id: string, input: LeadInput): Promise<CrmActionState<Lead>> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { error: "Você não tem permissão para editar leads." };
  }

  const validationError = validateLeadInput(input);
  if (validationError) return { error: validationError };

  const row = await prisma.lead.update({
    where: { id, clinicId: currentUser.clinicId },
    data: {
      name: input.name.trim(),
      phone: input.phone.trim(),
      email: input.email || null,
      origin: originToPrisma(input.origin),
      interest: input.interest.trim(),
      responsibleProfessionalId: input.responsibleProfessionalId || null,
      stage: input.stage,
      notes: input.notes || null,
    },
  });

  revalidatePath("/crm");
  return { data: mapLead(row) };
}

export async function deleteLead(id: string): Promise<CrmActionState> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { error: "Você não tem permissão para remover leads." };
  }

  await prisma.lead.delete({ where: { id, clinicId: currentUser.clinicId } });

  revalidatePath("/crm");
  return {};
}

export async function updateLeadStage(id: string, stage: LeadStage): Promise<CrmActionState<Lead>> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { error: "Você não tem permissão para mover leads." };
  }

  const row = await prisma.lead.update({
    where: { id, clinicId: currentUser.clinicId },
    data: { stage },
  });

  revalidatePath("/crm");
  return { data: mapLead(row) };
}

export async function addLeadInteraction(input: {
  leadId: string;
  type: InteractionType;
  content: string;
}): Promise<CrmActionState<Interaction>> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { error: "Você não tem permissão para registrar interações." };
  }
  if (!input.content.trim()) {
    return { error: "Escreva o conteúdo da interação." };
  }

  const today = new Date().toISOString().slice(0, 10);

  const row = await prisma.leadInteraction.create({
    data: {
      clinicId: currentUser.clinicId,
      leadId: input.leadId,
      type: input.type,
      content: input.content.trim(),
      date: today,
      author: currentUser.name,
    },
  });

  revalidatePath("/crm");
  return { data: mapInteraction(row) };
}

export async function convertLeadToPatient(
  leadId: string,
): Promise<CrmActionState<{ patientId: string }>> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { error: "Você não tem permissão para converter leads." };
  }

  const lead = await prisma.lead.findUnique({
    where: { id: leadId, clinicId: currentUser.clinicId },
  });
  if (!lead) {
    return { error: "Lead não encontrado." };
  }

  const today = new Date().toISOString().slice(0, 10);

  const result = await prisma.$transaction(async (tx) => {
    const patient = await tx.patient.create({
      data: {
        clinicId: currentUser.clinicId,
        name: lead.name,
        birthDate: today,
        phone: lead.phone,
        email: lead.email ?? undefined,
        responsibleProfessionalId: lead.responsibleProfessionalId ?? undefined,
        status: "ativo",
        notes: lead.notes ?? undefined,
      },
    });

    await tx.lead.update({
      where: { id: lead.id },
      data: { stage: "convertido", convertedPatientId: patient.id },
    });

    return patient;
  });

  revalidatePath("/crm");
  revalidatePath("/pacientes");
  return { data: { patientId: mapPatient(result).id } };
}
