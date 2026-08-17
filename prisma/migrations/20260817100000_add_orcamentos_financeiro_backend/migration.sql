-- CreateEnum
CREATE TYPE "BudgetStatus" AS ENUM ('rascunho', 'enviado', 'aprovado', 'recusado', 'expirado');

-- CreateEnum
CREATE TYPE "ChargeSourceType" AS ENUM ('orcamento', 'consulta');

-- CreateEnum
CREATE TYPE "ChargeStatus" AS ENUM ('pendente', 'pago', 'cancelado');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('dinheiro', 'cartao_credito', 'cartao_debito', 'pix', 'boleto');

-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('aluguel', 'salarios', 'fornecedores', 'marketing', 'utilidades', 'outros');

-- CreateEnum
CREATE TYPE "ExpenseStatus" AS ENUM ('pendente', 'pago');

-- CreateEnum
CREATE TYPE "ExpenseRecurrence" AS ENUM ('mensal', 'anual');

-- CreateTable
CREATE TABLE "Procedure" (
    "id" UUID NOT NULL,
    "clinicId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Procedure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Budget" (
    "id" UUID NOT NULL,
    "clinicId" UUID NOT NULL,
    "patientId" UUID NOT NULL,
    "responsibleProfessionalId" UUID,
    "discountPercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "validUntil" TEXT NOT NULL,
    "status" "BudgetStatus" NOT NULL DEFAULT 'rascunho',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetItem" (
    "id" UUID NOT NULL,
    "budgetId" UUID NOT NULL,
    "procedureId" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "BudgetItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Charge" (
    "id" UUID NOT NULL,
    "clinicId" UUID NOT NULL,
    "patientId" UUID NOT NULL,
    "sourceType" "ChargeSourceType" NOT NULL,
    "budgetId" UUID,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "dueDate" TEXT NOT NULL,
    "status" "ChargeStatus" NOT NULL DEFAULT 'pendente',
    "paymentMethod" "PaymentMethod",
    "paidAt" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Charge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" UUID NOT NULL,
    "clinicId" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "category" "ExpenseCategory" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "dueDate" TEXT NOT NULL,
    "status" "ExpenseStatus" NOT NULL DEFAULT 'pendente',
    "paidAt" TEXT,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurrence" "ExpenseRecurrence",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Procedure_clinicId_idx" ON "Procedure"("clinicId");

-- CreateIndex
CREATE INDEX "Budget_clinicId_idx" ON "Budget"("clinicId");

-- CreateIndex
CREATE INDEX "Budget_patientId_idx" ON "Budget"("patientId");

-- CreateIndex
CREATE INDEX "BudgetItem_budgetId_idx" ON "BudgetItem"("budgetId");

-- CreateIndex
CREATE INDEX "Charge_clinicId_idx" ON "Charge"("clinicId");

-- CreateIndex
CREATE INDEX "Charge_patientId_idx" ON "Charge"("patientId");

-- CreateIndex
CREATE INDEX "Charge_budgetId_idx" ON "Charge"("budgetId");

-- CreateIndex
CREATE INDEX "Expense_clinicId_idx" ON "Expense"("clinicId");

-- AddForeignKey
ALTER TABLE "Procedure" ADD CONSTRAINT "Procedure_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_responsibleProfessionalId_fkey" FOREIGN KEY ("responsibleProfessionalId") REFERENCES "Professional"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetItem" ADD CONSTRAINT "BudgetItem_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetItem" ADD CONSTRAINT "BudgetItem_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "Procedure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Charge" ADD CONSTRAINT "Charge_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Charge" ADD CONSTRAINT "Charge_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Charge" ADD CONSTRAINT "Charge_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RLS
-- Orçamentos: recepcionista e gestor gerenciam, profissional só visualiza
-- (igual à Agenda). Financeiro é mais sensível (dinheiro/inadimplência):
-- só gestor acessa, nem select pros outros perfis.

ALTER TABLE "Procedure" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Budget" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BudgetItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Charge" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Expense" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "procedure_select_same_clinic" ON "Procedure"
  FOR SELECT
  USING ("clinicId" = public.current_clinic_id());

CREATE POLICY "procedure_write_manager" ON "Procedure"
  FOR INSERT
  WITH CHECK ("clinicId" = public.current_clinic_id() AND public.current_user_role() IN ('recepcionista', 'gestor'));

CREATE POLICY "procedure_update_manager" ON "Procedure"
  FOR UPDATE
  USING ("clinicId" = public.current_clinic_id() AND public.current_user_role() IN ('recepcionista', 'gestor'));

CREATE POLICY "procedure_delete_manager" ON "Procedure"
  FOR DELETE
  USING ("clinicId" = public.current_clinic_id() AND public.current_user_role() IN ('recepcionista', 'gestor'));

CREATE POLICY "budget_select_same_clinic" ON "Budget"
  FOR SELECT
  USING ("clinicId" = public.current_clinic_id());

CREATE POLICY "budget_insert_manager" ON "Budget"
  FOR INSERT
  WITH CHECK ("clinicId" = public.current_clinic_id() AND public.current_user_role() IN ('recepcionista', 'gestor'));

CREATE POLICY "budget_update_manager" ON "Budget"
  FOR UPDATE
  USING ("clinicId" = public.current_clinic_id() AND public.current_user_role() IN ('recepcionista', 'gestor'));

CREATE POLICY "budget_delete_manager" ON "Budget"
  FOR DELETE
  USING ("clinicId" = public.current_clinic_id() AND public.current_user_role() IN ('recepcionista', 'gestor'));

CREATE POLICY "budget_item_select_same_clinic" ON "BudgetItem"
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM "Budget" b WHERE b.id = "BudgetItem"."budgetId" AND b."clinicId" = public.current_clinic_id()));

CREATE POLICY "budget_item_write_manager" ON "BudgetItem"
  FOR INSERT
  WITH CHECK (public.current_user_role() IN ('recepcionista', 'gestor'));

CREATE POLICY "budget_item_delete_manager" ON "BudgetItem"
  FOR DELETE
  USING (public.current_user_role() IN ('recepcionista', 'gestor'));

CREATE POLICY "charge_select_gestor" ON "Charge"
  FOR SELECT
  USING ("clinicId" = public.current_clinic_id() AND public.current_user_role() = 'gestor');

CREATE POLICY "charge_insert_gestor" ON "Charge"
  FOR INSERT
  WITH CHECK ("clinicId" = public.current_clinic_id() AND public.current_user_role() = 'gestor');

CREATE POLICY "charge_update_gestor" ON "Charge"
  FOR UPDATE
  USING ("clinicId" = public.current_clinic_id() AND public.current_user_role() = 'gestor');

CREATE POLICY "charge_delete_gestor" ON "Charge"
  FOR DELETE
  USING ("clinicId" = public.current_clinic_id() AND public.current_user_role() = 'gestor');

CREATE POLICY "expense_select_gestor" ON "Expense"
  FOR SELECT
  USING ("clinicId" = public.current_clinic_id() AND public.current_user_role() = 'gestor');

CREATE POLICY "expense_insert_gestor" ON "Expense"
  FOR INSERT
  WITH CHECK ("clinicId" = public.current_clinic_id() AND public.current_user_role() = 'gestor');

CREATE POLICY "expense_update_gestor" ON "Expense"
  FOR UPDATE
  USING ("clinicId" = public.current_clinic_id() AND public.current_user_role() = 'gestor');

CREATE POLICY "expense_delete_gestor" ON "Expense"
  FOR DELETE
  USING ("clinicId" = public.current_clinic_id() AND public.current_user_role() = 'gestor');
