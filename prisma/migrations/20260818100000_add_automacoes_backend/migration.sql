-- CreateEnum
CREATE TYPE "AutomationStatus" AS ENUM ('ativa', 'pausada');

-- CreateEnum
CREATE TYPE "AutomationChannel" AS ENUM ('whatsapp', 'email', 'notificacao_interna');

-- CreateTable
CREATE TABLE "AutomationRule" (
    "id" UUID NOT NULL,
    "clinicId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "trigger" JSONB NOT NULL,
    "condition" JSONB,
    "action" JSONB NOT NULL,
    "status" "AutomationStatus" NOT NULL DEFAULT 'ativa',
    "targetPatientIds" UUID[] NOT NULL DEFAULT ARRAY[]::UUID[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastTriggeredAt" TIMESTAMP(3),

    CONSTRAINT "AutomationRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomationLog" (
    "id" UUID NOT NULL,
    "clinicId" UUID NOT NULL,
    "ruleId" UUID NOT NULL,
    "patientId" UUID,
    "targetLabel" TEXT,
    "channel" "AutomationChannel" NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AutomationLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AutomationRule_clinicId_idx" ON "AutomationRule"("clinicId");

-- CreateIndex
CREATE INDEX "AutomationLog_clinicId_ruleId_idx" ON "AutomationLog"("clinicId", "ruleId");

-- CreateIndex
CREATE INDEX "AutomationLog_patientId_idx" ON "AutomationLog"("patientId");

-- AddForeignKey
ALTER TABLE "AutomationRule" ADD CONSTRAINT "AutomationRule_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationLog" ADD CONSTRAINT "AutomationLog_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationLog" ADD CONSTRAINT "AutomationLog_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "AutomationRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationLog" ADD CONSTRAINT "AutomationLog_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- RLS
-- Automações: recepcionista e gestor gerenciam (criam regras, disparam
-- mensagens), profissional só visualiza — igual ao padrão de CRM/orçamentos.
-- AutomationLog é o histórico de auditoria: leitura pra todo mundo da
-- clínica, escrita só por quem pode disparar; sem policy de UPDATE/DELETE
-- (RLS nega por padrão) porque é um registro imutável.

ALTER TABLE "AutomationRule" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AutomationLog" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "automation_rule_select_same_clinic" ON "AutomationRule"
  FOR SELECT
  USING ("clinicId" = public.current_clinic_id());

CREATE POLICY "automation_rule_insert_manager" ON "AutomationRule"
  FOR INSERT
  WITH CHECK ("clinicId" = public.current_clinic_id() AND public.current_user_role() IN ('recepcionista', 'gestor'));

CREATE POLICY "automation_rule_update_manager" ON "AutomationRule"
  FOR UPDATE
  USING ("clinicId" = public.current_clinic_id() AND public.current_user_role() IN ('recepcionista', 'gestor'));

CREATE POLICY "automation_rule_delete_manager" ON "AutomationRule"
  FOR DELETE
  USING ("clinicId" = public.current_clinic_id() AND public.current_user_role() IN ('recepcionista', 'gestor'));

CREATE POLICY "automation_log_select_same_clinic" ON "AutomationLog"
  FOR SELECT
  USING ("clinicId" = public.current_clinic_id());

CREATE POLICY "automation_log_insert_manager" ON "AutomationLog"
  FOR INSERT
  WITH CHECK ("clinicId" = public.current_clinic_id() AND public.current_user_role() IN ('recepcionista', 'gestor'));
