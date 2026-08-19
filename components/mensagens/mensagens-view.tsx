"use client";

import { MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";

import { BoardView } from "@/components/mensagens/board-view";
import { ChatThread } from "@/components/mensagens/chat-thread";
import { ConversationsList } from "@/components/mensagens/conversations-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getOrCreateConversation, listConversations } from "@/lib/actions/chat";
import type { BoardNote } from "@/lib/board-types";
import type { ChatConversation, TeamMember } from "@/lib/chat-types";

const POLL_INTERVAL_MS = 15000;

export function MensagensView({
  currentUserId,
  initialConversations,
  teamMembers,
  initialBoardNotes,
}: {
  currentUserId: string;
  initialConversations: ChatConversation[];
  teamMembers: TeamMember[];
  initialBoardNotes: BoardNote[];
}) {
  const [conversations, setConversations] = useState<ChatConversation[]>(initialConversations);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(
    initialConversations[0]?.id ?? null,
  );

  useEffect(() => {
    const interval = setInterval(async () => {
      const result = await listConversations();
      if (result.data) setConversations(result.data);
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  async function handleSelectTeamMember(userId: string) {
    const existing = conversations.find((conversation) => conversation.otherUserId === userId);
    if (existing) {
      setSelectedConversationId(existing.id);
      return;
    }
    const result = await getOrCreateConversation(userId);
    if (result.data) {
      const refreshed = await listConversations();
      if (refreshed.data) setConversations(refreshed.data);
      setSelectedConversationId(result.data.id);
    }
  }

  function handleMessageSent() {
    listConversations().then((result) => {
      if (result.data) setConversations(result.data);
    });
  }

  function handleThreadOpened(conversationId: string) {
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === conversationId ? { ...conversation, unreadCount: 0 } : conversation,
      ),
    );
  }

  const selectedConversation = conversations.find(
    (conversation) => conversation.id === selectedConversationId,
  );

  return (
    <Tabs defaultValue="mural" className="flex h-[calc(100vh-8rem)] flex-col gap-4">
      <TabsList className="self-start">
        <TabsTrigger value="mural">Mural</TabsTrigger>
        <TabsTrigger value="diretas">Diretas</TabsTrigger>
      </TabsList>

      <TabsContent value="mural" className="min-h-0 flex-1">
        <BoardView currentUserId={currentUserId} initialNotes={initialBoardNotes} />
      </TabsContent>

      <TabsContent value="diretas" className="flex min-h-0 flex-1 gap-4">
        <div className="w-full max-w-xs shrink-0">
          <ConversationsList
            conversations={conversations}
            teamMembers={teamMembers}
            selectedConversationId={selectedConversationId}
            onSelectConversation={setSelectedConversationId}
            onSelectTeamMember={handleSelectTeamMember}
          />
        </div>

        <div className="flex-1">
          {selectedConversation ? (
            <ChatThread
              key={selectedConversation.id}
              conversationId={selectedConversation.id}
              currentUserId={currentUserId}
              otherUserName={selectedConversation.otherUserName}
              onMessageSent={handleMessageSent}
              onThreadOpened={() => handleThreadOpened(selectedConversation.id)}
            />
          ) : (
            <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed">
              <MessageSquare className="size-8" />
              <p className="text-sm">Selecione alguém da equipe para começar uma conversa.</p>
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
