import { ShieldAlert } from "lucide-react";
import type { Metadata } from "next";

import { ConfiguracoesView } from "@/components/configuracoes/configuracoes-view";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { deriveInitials } from "@/lib/mock-pacientes";
import type { SystemUser } from "@/lib/mock-usuarios";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Configurações — ClinicFlow",
};

export default async function ConfiguracoesPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "gestor") {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center gap-2 py-16 text-center">
          <ShieldAlert className="text-muted-foreground size-8" />
          <p className="text-foreground text-sm font-medium">Acesso restrito</p>
          <p className="text-muted-foreground max-w-sm text-sm">
            Só o perfil Gestor/Admin pode acessar as configurações da clínica.
          </p>
        </CardContent>
      </Card>
    );
  }

  const users = await prisma.user.findMany({
    where: { clinicId: currentUser.clinicId },
    orderBy: { createdAt: "asc" },
  });

  const initialUsers: SystemUser[] = users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    initials: deriveInitials(user.name),
    role: user.role,
    status: user.status,
  }));

  return <ConfiguracoesView initialUsers={initialUsers} />;
}
