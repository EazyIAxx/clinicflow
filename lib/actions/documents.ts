"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth";
import type { DocumentCategory } from "@/lib/document-access";
import { inferFileType, mapDocument, type PatientDocument } from "@/lib/patient-types";
import { prisma } from "@/lib/prisma";
import {
  buildDocumentStoragePath,
  deleteDocumentFile,
  getDocumentSignedUrl,
  uploadDocumentFile,
} from "@/lib/supabase/storage";

export type DocumentActionState<T = undefined> = {
  error?: string;
  data?: T;
};

function canSeeCategory(role: string, category: DocumentCategory): boolean {
  return !(category === "exame" && role === "recepcionista");
}

export async function uploadDocument(input: {
  patientId: string;
  category: DocumentCategory;
  file: File;
}): Promise<DocumentActionState<PatientDocument>> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { error: "Você não tem permissão para enviar documentos." };
  }
  if (!input.file || input.file.size === 0) {
    return { error: "Selecione um arquivo." };
  }

  const patient = await prisma.patient.findUnique({
    where: { id: input.patientId, clinicId: currentUser.clinicId },
  });
  if (!patient) {
    return { error: "Paciente não encontrado." };
  }

  const documentId = crypto.randomUUID();
  const storagePath = buildDocumentStoragePath(
    currentUser.clinicId,
    input.patientId,
    documentId,
    input.file.name,
  );

  const uploadResult = await uploadDocumentFile(storagePath, input.file);
  if (uploadResult.error) {
    return { error: `Falha ao enviar o arquivo: ${uploadResult.error}` };
  }

  const row = await prisma.document.create({
    data: {
      id: documentId,
      clinicId: currentUser.clinicId,
      patientId: input.patientId,
      name: input.file.name,
      category: input.category,
      storagePath,
      fileType: inferFileType(input.file.name),
      sizeBytes: input.file.size,
      uploadedBy: currentUser.name,
    },
  });

  revalidatePath("/prontuarios");
  revalidatePath(`/pacientes/${input.patientId}`);
  return { data: mapDocument(row) };
}

export async function deleteDocument(id: string): Promise<DocumentActionState> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { error: "Você não tem permissão para remover documentos." };
  }

  const document = await prisma.document.findUnique({
    where: { id, clinicId: currentUser.clinicId },
  });
  if (!document) {
    return { error: "Documento não encontrado." };
  }
  if (!canSeeCategory(currentUser.role, document.category)) {
    return { error: "Você não tem permissão para remover esse documento." };
  }

  await prisma.document.delete({ where: { id } });
  await deleteDocumentFile(document.storagePath);

  revalidatePath("/prontuarios");
  revalidatePath(`/pacientes/${document.patientId}`);
  return {};
}

export async function getDocumentUrl(id: string): Promise<DocumentActionState<string>> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { error: "Você não tem permissão para ver esse documento." };
  }

  const document = await prisma.document.findUnique({
    where: { id, clinicId: currentUser.clinicId },
  });
  if (!document) {
    return { error: "Documento não encontrado." };
  }
  if (!canSeeCategory(currentUser.role, document.category)) {
    return { error: "Você não tem permissão para ver esse documento." };
  }

  const url = await getDocumentSignedUrl(document.storagePath);
  if (!url) {
    return { error: "Não foi possível gerar o link do arquivo." };
  }

  return { data: url };
}
