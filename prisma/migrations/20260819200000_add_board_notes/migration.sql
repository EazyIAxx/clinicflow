-- CreateTable
CREATE TABLE "BoardNote" (
    "id" UUID NOT NULL,
    "clinicId" UUID NOT NULL,
    "authorId" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BoardNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BoardNote_clinicId_createdAt_idx" ON "BoardNote"("clinicId", "createdAt");

-- AddForeignKey
ALTER TABLE "BoardNote" ADD CONSTRAINT "BoardNote_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardNote" ADD CONSTRAINT "BoardNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RLS: qualquer um da clínica vê todos os recados do mural; só o autor
-- cria (com o próprio id) e apaga o que escreveu.

ALTER TABLE "BoardNote" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "board_note_select_same_clinic" ON "BoardNote"
  FOR SELECT
  USING ("clinicId" = public.current_clinic_id());

CREATE POLICY "board_note_insert_own" ON "BoardNote"
  FOR INSERT
  WITH CHECK (
    "clinicId" = public.current_clinic_id()
    AND "authorId" = auth.uid()
  );

CREATE POLICY "board_note_delete_own" ON "BoardNote"
  FOR DELETE
  USING (
    "clinicId" = public.current_clinic_id()
    AND "authorId" = auth.uid()
  );
