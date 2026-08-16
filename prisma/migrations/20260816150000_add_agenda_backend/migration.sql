-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('pendente', 'confirmada', 'remarcada', 'cancelada', 'bloqueio');

-- CreateEnum
CREATE TYPE "AppointmentKind" AS ENUM ('consulta', 'bloqueio');

-- CreateTable
CREATE TABLE "Professional" (
    "id" UUID NOT NULL,
    "clinicId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "room" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Professional_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" UUID NOT NULL,
    "clinicId" UUID NOT NULL,
    "professionalId" UUID NOT NULL,
    "date" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "status" "AppointmentStatus" NOT NULL,
    "kind" "AppointmentKind" NOT NULL,
    "patientName" TEXT,
    "service" TEXT,
    "reason" TEXT,
    "notes" TEXT,
    "rescheduledFromDate" TEXT,
    "rescheduledFromTime" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Professional_clinicId_idx" ON "Professional"("clinicId");

-- CreateIndex
CREATE INDEX "Appointment_clinicId_date_idx" ON "Appointment"("clinicId", "date");

-- CreateIndex
CREATE INDEX "Appointment_professionalId_date_idx" ON "Appointment"("professionalId", "date");

-- AddForeignKey
ALTER TABLE "Professional" ADD CONSTRAINT "Professional_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "Professional"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RLS
-- Mesmo padrão da migration do M11: protege a API REST/GraphQL pública do
-- Supabase (chave anon/publishable); as Server Actions do Next.js (role
-- "postgres" via Prisma) fazem sua própria checagem de perfil no servidor.

ALTER TABLE "Professional" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Appointment" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "professional_select_same_clinic" ON "Professional"
  FOR SELECT
  USING ("clinicId" = public.current_clinic_id());

CREATE POLICY "professional_insert_manager" ON "Professional"
  FOR INSERT
  WITH CHECK ("clinicId" = public.current_clinic_id() AND public.current_user_role() IN ('recepcionista', 'gestor'));

CREATE POLICY "professional_update_manager" ON "Professional"
  FOR UPDATE
  USING ("clinicId" = public.current_clinic_id() AND public.current_user_role() IN ('recepcionista', 'gestor'));

CREATE POLICY "professional_delete_manager" ON "Professional"
  FOR DELETE
  USING ("clinicId" = public.current_clinic_id() AND public.current_user_role() IN ('recepcionista', 'gestor'));

CREATE POLICY "appointment_select_same_clinic" ON "Appointment"
  FOR SELECT
  USING ("clinicId" = public.current_clinic_id());

CREATE POLICY "appointment_insert_manager" ON "Appointment"
  FOR INSERT
  WITH CHECK ("clinicId" = public.current_clinic_id() AND public.current_user_role() IN ('recepcionista', 'gestor'));

CREATE POLICY "appointment_update_manager" ON "Appointment"
  FOR UPDATE
  USING ("clinicId" = public.current_clinic_id() AND public.current_user_role() IN ('recepcionista', 'gestor'));

CREATE POLICY "appointment_delete_manager" ON "Appointment"
  FOR DELETE
  USING ("clinicId" = public.current_clinic_id() AND public.current_user_role() IN ('recepcionista', 'gestor'));
