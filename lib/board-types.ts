import type { BoardNote as BoardNoteRow } from "@/lib/generated/prisma/client";

export type BoardNote = {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string; // ISO
};

export function mapBoardNote(row: BoardNoteRow & { author: { name: string } }): BoardNote {
  return {
    id: row.id,
    authorId: row.authorId,
    authorName: row.author.name,
    content: row.content,
    createdAt: row.createdAt.toISOString(),
  };
}
