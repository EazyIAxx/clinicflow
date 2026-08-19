"use server";

import { revalidatePath } from "next/cache";

import { mapBoardNote, type BoardNote } from "@/lib/board-types";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type BoardActionState<T = undefined> = {
  error?: string;
  data?: T;
};

export async function listBoardNotes(): Promise<BoardActionState<BoardNote[]>> {
  const currentUser = await getCurrentUser();
  if (!currentUser) return { error: "Não autenticado." };

  const rows = await prisma.boardNote.findMany({
    where: { clinicId: currentUser.clinicId },
    include: { author: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return { data: rows.map(mapBoardNote) };
}

export async function createBoardNote(content: string): Promise<BoardActionState<BoardNote>> {
  const currentUser = await getCurrentUser();
  if (!currentUser) return { error: "Não autenticado." };
  if (!content.trim()) return { error: "Escreva um recado." };

  const row = await prisma.boardNote.create({
    data: { clinicId: currentUser.clinicId, authorId: currentUser.id, content: content.trim() },
    include: { author: { select: { name: true } } },
  });

  revalidatePath("/mensagens");
  return { data: mapBoardNote(row) };
}

export async function deleteBoardNote(id: string): Promise<BoardActionState> {
  const currentUser = await getCurrentUser();
  if (!currentUser) return { error: "Não autenticado." };

  await prisma.boardNote.delete({ where: { id, authorId: currentUser.id } });

  revalidatePath("/mensagens");
  return {};
}
