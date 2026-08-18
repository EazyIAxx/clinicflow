"use client";

import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { ChatConversation, TeamMember } from "@/lib/chat-types";
import { userRoleLabels } from "@/lib/mock-usuarios";
import { deriveInitials } from "@/lib/patient-types";
import { cn } from "@/lib/utils";

export function ConversationsList({
  conversations,
  teamMembers,
  selectedConversationId,
  onSelectConversation,
  onSelectTeamMember,
}: {
  conversations: ChatConversation[];
  teamMembers: TeamMember[];
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onSelectTeamMember: (userId: string) => void;
}) {
  const [search, setSearch] = useState("");

  const conversationUserIds = new Set(conversations.map((conversation) => conversation.otherUserId));
  const membersWithoutConversation = teamMembers.filter(
    (member) => !conversationUserIds.has(member.id),
  );

  const filteredConversations = conversations.filter((conversation) =>
    conversation.otherUserName.toLowerCase().includes(search.toLowerCase()),
  );
  const filteredMembers = membersWithoutConversation.filter((member) =>
    member.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex h-full flex-col rounded-lg border">
      <div className="border-b p-3">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar na equipe..."
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length > 0 && (
          <div className="flex flex-col">
            {filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                type="button"
                onClick={() => onSelectConversation(conversation.id)}
                className={cn(
                  "flex items-start gap-2.5 border-b px-3 py-2.5 text-left transition-colors",
                  conversation.id === selectedConversationId ? "bg-muted" : "hover:bg-muted/50",
                )}
              >
                <Avatar className="size-8 shrink-0">
                  <AvatarFallback>{deriveInitials(conversation.otherUserName)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium">{conversation.otherUserName}</span>
                    {conversation.unreadCount > 0 && (
                      <Badge className="bg-primary text-primary-foreground h-4 min-w-4 shrink-0 justify-center rounded-full px-1 text-[10px]">
                        {conversation.unreadCount}
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground truncate text-xs">
                    {conversation.lastMessage?.content ?? "Nenhuma mensagem ainda"}
                  </p>
                  {conversation.lastMessage && (
                    <p className="text-muted-foreground/70 text-[11px]">
                      {formatDistanceToNow(new Date(conversation.lastMessage.createdAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {filteredMembers.length > 0 && (
          <div className="flex flex-col">
            <p className="text-muted-foreground px-3 pt-3 pb-1 text-xs font-medium">
              Iniciar conversa
            </p>
            {filteredMembers.map((member) => (
              <button
                key={member.id}
                type="button"
                onClick={() => onSelectTeamMember(member.id)}
                className="hover:bg-muted/50 flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors"
              >
                <Avatar className="size-8 shrink-0">
                  <AvatarFallback>{deriveInitials(member.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{member.name}</span>
                  <span className="text-muted-foreground text-xs">{userRoleLabels[member.role]}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {filteredConversations.length === 0 && filteredMembers.length === 0 && (
          <p className="text-muted-foreground px-3 py-6 text-center text-sm">
            Nenhum resultado encontrado.
          </p>
        )}
      </div>
    </div>
  );
}
