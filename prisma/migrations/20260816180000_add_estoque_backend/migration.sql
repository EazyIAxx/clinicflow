-- CreateEnum
CREATE TYPE "StockCategory" AS ENUM ('medicamento', 'material', 'insumo', 'equipamento');

-- CreateEnum
CREATE TYPE "StockMovementType" AS ENUM ('entrada', 'saida');

-- CreateTable
CREATE TABLE "StockItem" (
    "id" UUID NOT NULL,
    "clinicId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "category" "StockCategory" NOT NULL,
    "unit" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "minQuantity" INTEGER NOT NULL DEFAULT 0,
    "batch" TEXT,
    "expiresAt" TEXT,
    "supplier" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockMovement" (
    "id" UUID NOT NULL,
    "clinicId" UUID NOT NULL,
    "itemId" UUID NOT NULL,
    "type" "StockMovementType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "performedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StockItem_clinicId_idx" ON "StockItem"("clinicId");

-- CreateIndex
CREATE INDEX "StockMovement_clinicId_date_idx" ON "StockMovement"("clinicId", "date");

-- CreateIndex
CREATE INDEX "StockMovement_itemId_idx" ON "StockMovement"("itemId");

-- AddForeignKey
ALTER TABLE "StockItem" ADD CONSTRAINT "StockItem_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "StockItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RLS
-- Mesmo padrão das migrations anteriores: protege a API REST/GraphQL pública
-- do Supabase (chave anon/publishable); as Server Actions do Next.js (role
-- "postgres" via Prisma) fazem sua própria checagem de perfil no servidor.
--
-- Diferente da Agenda: aqui "profissional" não tem NENHUM acesso (nem
-- leitura), e só "gestor" pode escrever — reflete a matriz de permissões já
-- existente em lib/permissions.ts (estoque: recepcionista=visualizar,
-- profissional=nenhum, gestor=gerenciar).

ALTER TABLE "StockItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StockMovement" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stock_item_select_viewer" ON "StockItem"
  FOR SELECT
  USING ("clinicId" = public.current_clinic_id() AND public.current_user_role() IN ('recepcionista', 'gestor'));

CREATE POLICY "stock_item_insert_gestor" ON "StockItem"
  FOR INSERT
  WITH CHECK ("clinicId" = public.current_clinic_id() AND public.current_user_role() = 'gestor');

CREATE POLICY "stock_item_update_gestor" ON "StockItem"
  FOR UPDATE
  USING ("clinicId" = public.current_clinic_id() AND public.current_user_role() = 'gestor');

CREATE POLICY "stock_item_delete_gestor" ON "StockItem"
  FOR DELETE
  USING ("clinicId" = public.current_clinic_id() AND public.current_user_role() = 'gestor');

CREATE POLICY "stock_movement_select_viewer" ON "StockMovement"
  FOR SELECT
  USING ("clinicId" = public.current_clinic_id() AND public.current_user_role() IN ('recepcionista', 'gestor'));

CREATE POLICY "stock_movement_insert_gestor" ON "StockMovement"
  FOR INSERT
  WITH CHECK ("clinicId" = public.current_clinic_id() AND public.current_user_role() = 'gestor');
