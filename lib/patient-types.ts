import type { Document as DocumentRow, Patient as PatientRow } from "@/lib/generated/prisma/client";
import type { DocumentCategory } from "@/lib/document-access";
import type { PatientStatus } from "@/lib/patient-status";

export type Patient = {
  id: string;
  name: string;
  initials: string;
  birthDate: string; // yyyy-MM-dd
  phone: string;
  email?: string;
  cpf?: string;
  responsibleProfessionalId?: string;
  status: PatientStatus;
  notes?: string;
  createdAt: string; // yyyy-MM-dd
  lastVisitAt?: string;
  healthInsuranceProvider?: string;
  healthInsurancePlan?: string;
  healthInsuranceCardNumber?: string;
  healthInsuranceValidUntil?: string;
};

export type DocumentFileType = "pdf" | "image" | "doc";

export type PatientDocument = {
  id: string;
  patientId: string;
  name: string;
  category: DocumentCategory;
  fileType: DocumentFileType;
  sizeLabel: string;
  uploadedAt: string; // yyyy-MM-dd
  uploadedBy: string;
};

export function deriveInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function inferFileType(fileName: string): DocumentFileType {
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (extension === "pdf") return "pdf";
  if (["jpg", "jpeg", "png", "webp"].includes(extension)) return "image";
  return "doc";
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function mapPatient(row: PatientRow): Patient {
  return {
    id: row.id,
    name: row.name,
    initials: deriveInitials(row.name),
    birthDate: row.birthDate,
    phone: row.phone,
    email: row.email ?? undefined,
    cpf: row.cpf ?? undefined,
    responsibleProfessionalId: row.responsibleProfessionalId ?? undefined,
    status: row.status,
    notes: row.notes ?? undefined,
    createdAt: toDateKey(row.createdAt),
    lastVisitAt: row.lastVisitAt ?? undefined,
    healthInsuranceProvider: row.healthInsuranceProvider ?? undefined,
    healthInsurancePlan: row.healthInsurancePlan ?? undefined,
    healthInsuranceCardNumber: row.healthInsuranceCardNumber ?? undefined,
    healthInsuranceValidUntil: row.healthInsuranceValidUntil ?? undefined,
  };
}

export function mapDocument(row: DocumentRow): PatientDocument {
  return {
    id: row.id,
    patientId: row.patientId,
    name: row.name,
    category: row.category,
    fileType: row.fileType as DocumentFileType,
    sizeLabel: formatFileSize(row.sizeBytes),
    uploadedAt: toDateKey(row.createdAt),
    uploadedBy: row.uploadedBy,
  };
}
