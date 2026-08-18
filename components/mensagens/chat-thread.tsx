"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Send } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getMessages, getNewMessages, sendMessage } from "@/lib/actions/chat";
import type { ChatMessage } from "@/lib/chat-types";
import { deriveInitials } from "@/lib/patient-types";
import { cn } from "@/lib/utils";

const POLL_INTERVAL_MS = 4000;

export function ChatThread({
  conversationId,
  currentUserId,
  otherUserName,
  onMessageSent,
  onThreadOpened,
}: {
  conversationId: string;
  currentUserId: string;
  otherUserName: string;
  onMessageSent: () => void;
  onThreadOpened: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastMessageCreatedAtRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadInitial() {
      const result = await getMessages(conversationId);
      if (cancelled || !result.data) return;
      setMessages(result.data);
      lastMessageCreatedAtRef.current = result.data.at(-1)?.createdAt ?? null;
      onThreadOpened();
    }
    loadInitial();

    const interval = setInterval(async () => {
      if (!lastMessageCreatedAtRef.current) return;
      const result = await getNewMessages(conversationId, lastMessageCreatedAtRef.current);
      if (cancelled || !result.data || result.data.length === 0) return;
      setMessages((prev) => [...prev, ...result.data!]);
      lastMessageCreatedAtRef.current = result.data.at(-1)!.createdAt;
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.trim() || isSending) return;

    setIsSending(true);
    const result = await sendMessage(conversationId, draft);
    setIsSending(false);

    if (result.data) {
      setMessages((prev) => [...prev, result.data!]);
      lastMessageCreatedAtRef.current = result.data.createdAt;
      setDraft("");
      onMessageSent();
    }
  }

  return (
    <div className="flex h-full flex-col rounded-lg border">
      <div className="flex items-center gap-2.5 border-b p-3">
        <Avatar className="size-8">
          <AvatarFallback>{deriveInitials(otherUserName)}</AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium">{otherUserName}</span>
      </div>

      <div ref={scrollRef} className="flex flex-1 flex-col gap-2 overflow-y-auto p-3">
        {messages.length === 0 && (
          <p className="text-muted-foreground m-auto text-sm">
            Nenhuma mensagem ainda. Diga oi 👋
          </p>
        )}
        {messages.map((message) => {
          const isOwn = message.senderId === currentUserId;
          return (
            <div
              key={message.id}
              className={cn("flex flex-col", isOwn ? "items-end self-end" : "items-start self-start")}
            >
              <div
                className={cn(
                  "max-w-xs rounded-lg px-3 py-2 text-sm break-words sm:max-w-sm",
                  isOwn ? "bg-primary text-primary-foreground" : "bg-muted",
                )}
              >
                {message.content}
              </div>
              <span className="text-muted-foreground mt-0.5 text-[11px]">
                {format(new Date(message.createdAt), "HH:mm", { locale: ptBR })}
              </span>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="flex items-end gap-2 border-t p-3">
        <Textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }
          }}
          placeholder="Escreva uma mensagem..."
          rows={1}
          className="max-h-32 min-h-9 resize-none"
        />
        <Button type="submit" size="icon" disabled={!draft.trim() || isSending}>
          <Send />
          <span className="sr-only">Enviar</span>
        </Button>
      </form>
    </div>
  );
}
