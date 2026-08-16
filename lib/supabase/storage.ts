import { createAdminClient } from "@/lib/supabase/admin";

const DOCUMENTS_BUCKET = "documentos";

export function buildDocumentStoragePath(
  clinicId: string,
  patientId: string,
  documentId: string,
  fileName: string,
) {
  return `${clinicId}/${patientId}/${documentId}-${fileName}`;
}

export async function uploadDocumentFile(path: string, file: File): Promise<{ error?: string }> {
  const admin = createAdminClient();
  const { error } = await admin.storage.from(DOCUMENTS_BUCKET).upload(path, file, {
    contentType: file.type || undefined,
  });
  if (error) return { error: error.message };
  return {};
}

export async function deleteDocumentFile(path: string) {
  const admin = createAdminClient();
  await admin.storage.from(DOCUMENTS_BUCKET).remove([path]);
}

export async function getDocumentSignedUrl(path: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data, error } = await admin.storage.from(DOCUMENTS_BUCKET).createSignedUrl(path, 60 * 10);
  if (error || !data) return null;
  return data.signedUrl;
}
