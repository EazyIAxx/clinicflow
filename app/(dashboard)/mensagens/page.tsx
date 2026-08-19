import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { MensagensView } from "@/components/mensagens/mensagens-view";
import { listBoardNotes } from "@/lib/actions/board";
import { listConversations, listTeamMembers } from "@/lib/actions/chat";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Mensagens — ClinicFlow",
};

// Conversas e contagem de não lidas dependem do acesso real, não do build.
export const dynamic = "force-dynamic";

export default async function MensagensPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  const [conversationsResult, teamResult, boardNotesResult] = await Promise.all([
    listConversations(),
    listTeamMembers(),
    listBoardNotes(),
  ]);

  return (
    <MensagensView
      currentUserId={currentUser.id}
      initialConversations={conversationsResult.data ?? []}
      teamMembers={teamResult.data ?? []}
      initialBoardNotes={boardNotesResult.data ?? []}
    />
  );
}
