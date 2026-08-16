-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('recepcionista', 'profissional', 'gestor');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ativo', 'convite_pendente');

-- CreateTable
CREATE TABLE "Clinic" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "cnpj" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "hours" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Clinic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "clinicId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'convite_pendente',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RLS
-- Nota: a conexão do Prisma usa a role "postgres" (bypassa RLS por padrão),
-- então essas policies não afetam as queries do app em si — elas travam o
-- acesso direto às tabelas pela API REST/GraphQL auto-gerada do Supabase,
-- que usa a chave pública (anon/publishable) exposta no cliente.

ALTER TABLE "Clinic" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.current_clinic_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT "clinicId" FROM "User" WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS "UserRole"
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT "role" FROM "User" WHERE id = auth.uid();
$$;

CREATE POLICY "clinic_select_own" ON "Clinic"
  FOR SELECT
  USING (id = public.current_clinic_id());

CREATE POLICY "clinic_update_own_gestor" ON "Clinic"
  FOR UPDATE
  USING (id = public.current_clinic_id() AND public.current_user_role() = 'gestor');

CREATE POLICY "user_select_same_clinic" ON "User"
  FOR SELECT
  USING ("clinicId" = public.current_clinic_id());

CREATE POLICY "user_insert_gestor" ON "User"
  FOR INSERT
  WITH CHECK ("clinicId" = public.current_clinic_id() AND public.current_user_role() = 'gestor');

CREATE POLICY "user_update_gestor" ON "User"
  FOR UPDATE
  USING ("clinicId" = public.current_clinic_id() AND public.current_user_role() = 'gestor');

CREATE POLICY "user_delete_gestor" ON "User"
  FOR DELETE
  USING ("clinicId" = public.current_clinic_id() AND public.current_user_role() = 'gestor');
