"use client";

import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MessageSquareText, Send, Trash2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createBoardNote, deleteBoardNote, listBoardNotes } from "@/lib/actions/board";
import type { BoardNote } from "@/lib/board-types";
import { deriveInitials } from "@/lib/patient-types";

const POLL_INTERVAL_MS = 15000;

export function BoardView({
  currentUserId,
  initialNotes,
}: {
  currentUserId: string;
  initialNotes: BoardNote[];
}) {
  const [notes, setNotes] = useState<BoardNote[]>(initialNotes);
  const [draft, setDraft] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      const result = await listBoardNotes();
      if (result.data) setNotes(result.data);
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const result = await createBoardNote(draft);
    setIsSubmitting(false);

    if (result.data) {
      setNotes((prev) => [result.data!, ...prev]);
      setDraft("");
    }
  }

  async function handleDelete(id: string) {
    setNotes((prev) => prev.filter((note) => note.id !== id));
    await deleteBoardNote(id);
  }

  return (
    <div className="flex h-full flex-col gap-4 rounded-lg border p-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <Textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Deixe um recado pra equipe..."
          rows={2}
          className="resize-none"
        />
        <Button type="submit" disabled={!draft.trim() || isSubmitting} className="self-end">
          <Send />
          {isSubmitting ? "Enviando..." : "Publicar recado"}
        </Button>
      </form>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
        {notes.length === 0 && (
          <div className="text-muted-foreground m-auto flex flex-col items-center gap-2 text-center">
            <MessageSquareText className="size-8" />
            <p className="text-sm">Nenhum recado no mural ainda.</p>
          </div>
        )}
        {notes.map((note) => (
          <div key={note.id} className="flex items-start gap-2.5 rounded-md border p-3">
            <Avatar className="size-8 shrink-0">
              <AvatarFallback>{deriveInitials(note.authorName)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">{note.authorName}</span>
                <span className="text-muted-foreground text-xs">
                  {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true, locale: ptBR })}
                </span>
              </div>
              <p className="text-sm break-words whitespace-pre-wrap">{note.content}</p>
            </div>
            {note.authorId === currentUserId && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => handleDelete(note.id)}
                className="text-muted-foreground hover:text-destructive shrink-0"
              >
                <Trash2 />
                <span className="sr-only">Excluir</span>
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
