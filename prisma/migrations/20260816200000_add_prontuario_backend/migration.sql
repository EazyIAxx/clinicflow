-- CreateEnum
CREATE TYPE "PatientStatus" AS ENUM ('ativo', 'inativo');

-- CreateEnum
CREATE TYPE "DocumentCategory" AS ENUM ('exame', 'receita', 'atestado', 'documento');

-- CreateTable
CREATE TABLE "Patient" (
    "id" UUID NOT NULL,
    "clinicId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "birthDate" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "cpf" TEXT,
    "responsibleProfessionalId" UUID,
    "status" "PatientStatus" NOT NULL DEFAULT 'ativo',
    "notes" TEXT,
    "lastVisitAt" TEXT,
    "healthInsuranceProvider" TEXT,
    "healthInsurancePlan" TEXT,
    "healthInsuranceCardNumber" TEXT,
    "healthInsuranceValidUntil" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" UUID NOT NULL,
    "clinicId" UUID NOT NULL,
    "patientId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "category" "DocumentCategory" NOT NULL,
    "storagePath" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Patient_clinicId_idx" ON "Patient"("clinicId");

-- CreateIndex
CREATE INDEX "Patient_responsibleProfessionalId_idx" ON "Patient"("responsibleProfessionalId");

-- CreateIndex
CREATE INDEX "Document_clinicId_patientId_idx" ON "Document"("clinicId", "patientId");

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_responsibleProfessionalId_fkey" FOREIGN KEY ("responsibleProfessionalId") REFERENCES "Professional"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RLS
-- Mesmo padrão das migrations anteriores: protege a API pública do Supabase
-- (chave anon); Server Actions (Prisma/role "postgres") fazem sua própria
-- checagem de perfil. Todos os perfis (recepcionista/profissional/gestor)
-- têm acesso de paciente igual (matriz de permissões: "pacientes" = gerenciar
-- pra todo mundo) — a única restrição fina é categoria "exame", escondida de
-- recepcionista (lib/document-access.ts já tinha essa regra só na UI; agora
-- vira regra de verdade no banco).

ALTER TABLE "Patient" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Document" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "patient_select_same_clinic" ON "Patient"
  FOR SELECT
  USING ("clinicId" = public.current_clinic_id());

CREATE POLICY "patient_insert_same_clinic" ON "Patient"
  FOR INSERT
  WITH CHECK ("clinicId" = public.current_clinic_id());

CREATE POLICY "patient_update_same_clinic" ON "Patient"
  FOR UPDATE
  USING ("clinicId" = public.current_clinic_id());

CREATE POLICY "patient_delete_same_clinic" ON "Patient"
  FOR DELETE
  USING ("clinicId" = public.current_clinic_id());

CREATE POLICY "document_select_role_category" ON "Document"
  FOR SELECT
  USING (
    "clinicId" = public.current_clinic_id()
    AND (category != 'exame' OR public.current_user_role() != 'recepcionista')
  );

CREATE POLICY "document_insert_same_clinic" ON "Document"
  FOR INSERT
  WITH CHECK ("clinicId" = public.current_clinic_id());

CREATE POLICY "document_delete_same_clinic" ON "Document"
  FOR DELETE
  USING ("clinicId" = public.current_clinic_id());

-- Supabase Storage: bucket privado pra arquivos de prontuário, path
-- convencionado como {clinicId}/{patientId}/{documentId}-{nome do arquivo}
-- (o RLS abaixo usa o primeiro segmento do path pra isolar por clínica).

INSERT INTO storage.buckets (id, name, public)
VALUES ('documentos', 'documentos', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "document_storage_select" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'documentos'
    AND (storage.foldername(name))[1] = public.current_clinic_id()::text
  );

CREATE POLICY "document_storage_insert" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'documentos'
    AND (storage.foldername(name))[1] = public.current_clinic_id()::text
  );

CREATE POLICY "document_storage_delete" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'documentos'
    AND (storage.foldername(name))[1] = public.current_clinic_id()::text
  );
