-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('lembrete_consulta', 'estoque_baixo');

-- CreateTable
CREATE TABLE "Notification" (
    "id" UUID NOT NULL,
    "clinicId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" UUID NOT NULL,
    "clinicId" UUID NOT NULL,
    "userAId" UUID NOT NULL,
    "userBId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" UUID NOT NULL,
    "conversationId" UUID NOT NULL,
    "senderId" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_clinicId_userId_read_idx" ON "Notification"("clinicId", "userId", "read");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_userAId_userBId_key" ON "Conversation"("userAId", "userBId");

-- CreateIndex
CREATE INDEX "Conversation_clinicId_idx" ON "Conversation"("clinicId");

-- CreateIndex
CREATE INDEX "Message_conversationId_createdAt_idx" ON "Message"("conversationId", "createdAt");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_userAId_fkey" FOREIGN KEY ("userAId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_userBId_fkey" FOREIGN KEY ("userBId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RLS
-- Notification: só o próprio usuário lê/atualiza (marcar como lida) as suas.
-- Conversation/Message: só os dois participantes leem; mensagem só pode ser
-- inserida por quem participa da conversa, com senderId = auth.uid().

ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Conversation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notification_select_own" ON "Notification"
  FOR SELECT
  USING ("clinicId" = public.current_clinic_id() AND "userId" = auth.uid());

CREATE POLICY "notification_update_own" ON "Notification"
  FOR UPDATE
  USING ("clinicId" = public.current_clinic_id() AND "userId" = auth.uid());

CREATE POLICY "conversation_select_participant" ON "Conversation"
  FOR SELECT
  USING (
    "clinicId" = public.current_clinic_id()
    AND auth.uid() IN ("userAId", "userBId")
  );

CREATE POLICY "conversation_insert_participant" ON "Conversation"
  FOR INSERT
  WITH CHECK (
    "clinicId" = public.current_clinic_id()
    AND auth.uid() IN ("userAId", "userBId")
  );

CREATE POLICY "message_select_participant" ON "Message"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "Conversation" c
      WHERE c.id = "Message"."conversationId"
        AND c."clinicId" = public.current_clinic_id()
        AND auth.uid() IN (c."userAId", c."userBId")
    )
  );

CREATE POLICY "message_insert_participant" ON "Message"
  FOR INSERT
  WITH CHECK (
    "senderId" = auth.uid()
    AND EXISTS (
      SELECT 1 FROM "Conversation" c
      WHERE c.id = "Message"."conversationId"
        AND c."clinicId" = public.current_clinic_id()
        AND auth.uid() IN (c."userAId", c."userBId")
    )
  );

CREATE POLICY "message_update_recipient" ON "Message"
  FOR UPDATE
  USING (
    "senderId" != auth.uid()
    AND EXISTS (
      SELECT 1 FROM "Conversation" c
      WHERE c.id = "Message"."conversationId"
        AND c."clinicId" = public.current_clinic_id()
        AND auth.uid() IN (c."userAId", c."userBId")
    )
  );
