"use server";

import { revalidatePath } from "next/cache";

import { mapMessage, type ChatConversation, type ChatMessage, type TeamMember } from "@/lib/chat-types";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type ChatActionState<T = undefined> = {
  error?: string;
  data?: T;
};

export async function listTeamMembers(): Promise<ChatActionState<TeamMember[]>> {
  const currentUser = await getCurrentUser();
  if (!currentUser) return { error: "Não autenticado." };

  const users = await prisma.user.findMany({
    where: { clinicId: currentUser.clinicId, id: { not: currentUser.id }, status: "ativo" },
    orderBy: { name: "asc" },
  });

  return { data: users.map((user) => ({ id: user.id, name: user.name, role: user.role })) };
}

export async function listConversations(): Promise<ChatActionState<ChatConversation[]>> {
  const currentUser = await getCurrentUser();
  if (!currentUser) return { error: "Não autenticado." };

  const conversations = await prisma.conversation.findMany({
    where: {
      clinicId: currentUser.clinicId,
      OR: [{ userAId: currentUser.id }, { userBId: currentUser.id }],
    },
    include: {
      userA: true,
      userB: true,
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  const unreadCounts = await prisma.message.groupBy({
    by: ["conversationId"],
    where: {
      conversationId: { in: conversations.map((conversation) => conversation.id) },
      senderId: { not: currentUser.id },
      readAt: null,
    },
    _count: { id: true },
  });
  const unreadByConversation = Object.fromEntries(
    unreadCounts.map((row) => [row.conversationId, row._count.id]),
  );

  const result: ChatConversation[] = conversations.map((conversation) => {
    const other = conversation.userAId === currentUser.id ? conversation.userB : conversation.userA;
    const lastMessage = conversation.messages[0];
    return {
      id: conversation.id,
      otherUserId: other.id,
      otherUserName: other.name,
      otherUserRole: other.role,
      lastMessage: lastMessage ? mapMessage(lastMessage) : undefined,
      unreadCount: unreadByConversation[conversation.id] ?? 0,
    };
  });

  result.sort((a, b) => {
    const aTime = a.lastMessage?.createdAt ?? "";
    const bTime = b.lastMessage?.createdAt ?? "";
    return bTime.localeCompare(aTime);
  });

  return { data: result };
}

export async function getOrCreateConversation(
  otherUserId: string,
): Promise<ChatActionState<{ id: string }>> {
  const currentUser = await getCurrentUser();
  if (!currentUser) return { error: "Não autenticado." };
  if (otherUserId === currentUser.id) {
    return { error: "Não é possível iniciar uma conversa consigo mesmo." };
  }

  const other = await prisma.user.findFirst({
    where: { id: otherUserId, clinicId: currentUser.clinicId },
  });
  if (!other) return { error: "Usuário não encontrado." };

  const [userAId, userBId] = [currentUser.id, otherUserId].sort();

  const conversation = await prisma.conversation.upsert({
    where: { userAId_userBId: { userAId, userBId } },
    update: {},
    create: { clinicId: currentUser.clinicId, userAId, userBId },
  });

  return { data: { id: conversation.id } };
}

async function requireParticipant(conversationId: string, userId: string, clinicId: string) {
  return prisma.conversation.findFirst({
    where: {
      id: conversationId,
      clinicId,
      OR: [{ userAId: userId }, { userBId: userId }],
    },
  });
}

export async function getMessages(conversationId: string): Promise<ChatActionState<ChatMessage[]>> {
  const currentUser = await getCurrentUser();
  if (!currentUser) return { error: "Não autenticado." };

  const conversation = await requireParticipant(conversationId, currentUser.id, currentUser.clinicId);
  if (!conversation) return { error: "Conversa não encontrada." };

  const rows = await prisma.message.findMany({ where: { conversationId }, orderBy: { createdAt: "asc" } });

  await prisma.message.updateMany({
    where: { conversationId, senderId: { not: currentUser.id }, readAt: null },
    data: { readAt: new Date() },
  });

  return { data: rows.map(mapMessage) };
}

export async function sendMessage(
  conversationId: string,
  content: string,
): Promise<ChatActionState<ChatMessage>> {
  const currentUser = await getCurrentUser();
  if (!currentUser) return { error: "Não autenticado." };
  if (!content.trim()) return { error: "Digite uma mensagem." };

  const conversation = await requireParticipant(conversationId, currentUser.id, currentUser.clinicId);
  if (!conversation) return { error: "Conversa não encontrada." };

  const row = await prisma.message.create({
    data: { conversationId, senderId: currentUser.id, content: content.trim() },
  });

  revalidatePath("/mensagens");
  return { data: mapMessage(row) };
}

/** Polling: mensagens novas desde `afterCreatedAt`, pra atualizar a thread sem recarregar tudo. */
export async function getNewMessages(
  conversationId: string,
  afterCreatedAt: string,
): Promise<ChatActionState<ChatMessage[]>> {
  const currentUser = await getCurrentUser();
  if (!currentUser) return { error: "Não autenticado." };

  const conversation = await requireParticipant(conversationId, currentUser.id, currentUser.clinicId);
  if (!conversation) return { error: "Conversa não encontrada." };

  const rows = await prisma.message.findMany({
    where: { conversationId, createdAt: { gt: new Date(afterCreatedAt) } },
    orderBy: { createdAt: "asc" },
  });

  if (rows.length > 0) {
    await prisma.message.updateMany({
      where: { conversationId, senderId: { not: currentUser.id }, readAt: null },
      data: { readAt: new Date() },
    });
  }

  return { data: rows.map(mapMessage) };
}

export async function getUnreadMessageCount(): Promise<ChatActionState<number>> {
  const currentUser = await getCurrentUser();
  if (!currentUser) return { error: "Não autenticado." };

  const count = await prisma.message.count({
    where: {
      readAt: null,
      senderId: { not: currentUser.id },
      conversation: {
        clinicId: currentUser.clinicId,
        OR: [{ userAId: currentUser.id }, { userBId: currentUser.id }],
      },
    },
  });

  return { data: count };
}
