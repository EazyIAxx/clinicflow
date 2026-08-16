-- CreateEnum
CREATE TYPE "LeadOrigin" AS ENUM ('instagram', 'indicacao', 'google', 'whatsapp', 'site', 'outro');

-- CreateEnum
CREATE TYPE "LeadStage" AS ENUM ('novo', 'em_conversa', 'agendado', 'convertido', 'perdido');

-- CreateEnum
CREATE TYPE "InteractionType" AS ENUM ('nota', 'ligacao', 'mensagem');

-- CreateTable
CREATE TABLE "Lead" (
    "id" UUID NOT NULL,
    "clinicId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "origin" "LeadOrigin" NOT NULL,
    "interest" TEXT NOT NULL,
    "responsibleProfessionalId" UUID,
    "stage" "LeadStage" NOT NULL DEFAULT 'novo',
    "notes" TEXT,
    "convertedPatientId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadInteraction" (
    "id" UUID NOT NULL,
    "clinicId" UUID NOT NULL,
    "leadId" UUID NOT NULL,
    "type" "InteractionType" NOT NULL,
    "content" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Lead_clinicId_idx" ON "Lead"("clinicId");

-- CreateIndex
CREATE INDEX "Lead_responsibleProfessionalId_idx" ON "Lead"("responsibleProfessionalId");

-- CreateIndex
CREATE INDEX "LeadInteraction_clinicId_leadId_idx" ON "LeadInteraction"("clinicId", "leadId");

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_responsibleProfessionalId_fkey" FOREIGN KEY ("responsibleProfessionalId") REFERENCES "Professional"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadInteraction" ADD CONSTRAINT "LeadInteraction_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadInteraction" ADD CONSTRAINT "LeadInteraction_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RLS
-- Mesmo padrão das migrations anteriores: protege a API pública do Supabase;
-- Server Actions fazem a própria checagem. CRM é acesso igual pros três
-- perfis (recepcionista/profissional/gestor), igual ao módulo de pacientes.

ALTER TABLE "Lead" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LeadInteraction" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lead_select_same_clinic" ON "Lead"
  FOR SELECT
  USING ("clinicId" = public.current_clinic_id());

CREATE POLICY "lead_insert_same_clinic" ON "Lead"
  FOR INSERT
  WITH CHECK ("clinicId" = public.current_clinic_id());

CREATE POLICY "lead_update_same_clinic" ON "Lead"
  FOR UPDATE
  USING ("clinicId" = public.current_clinic_id());

CREATE POLICY "lead_delete_same_clinic" ON "Lead"
  FOR DELETE
  USING ("clinicId" = public.current_clinic_id());

CREATE POLICY "lead_interaction_select_same_clinic" ON "LeadInteraction"
  FOR SELECT
  USING ("clinicId" = public.current_clinic_id());

CREATE POLICY "lead_interaction_insert_same_clinic" ON "LeadInteraction"
  FOR INSERT
  WITH CHECK ("clinicId" = public.current_clinic_id());
