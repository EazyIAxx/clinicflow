import type { Message as MessageRow } from "@/lib/generated/prisma/client";
import type { UserRole } from "@/lib/mock-usuarios";

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  readAt?: string;
  createdAt: string; // ISO
};

export type ChatConversation = {
  id: string;
  otherUserId: string;
  otherUserName: string;
  otherUserRole: UserRole;
  lastMessage?: ChatMessage;
  unreadCount: number;
};

export type TeamMember = {
  id: string;
  name: string;
  role: UserRole;
};

export function mapMessage(row: MessageRow): ChatMessage {
  return {
    id: row.id,
    conversationId: row.conversationId,
    senderId: row.senderId,
    content: row.content,
    readAt: row.readAt ? row.readAt.toISOString() : undefined,
    createdAt: row.createdAt.toISOString(),
  };
}
