import { ShieldAlert } from "lucide-react";
import type { Metadata } from "next";

import { ProfissionaisView } from "@/components/profissionais/profissionais-view";
import { Card, CardContent } from "@/components/ui/card";
import { mapProfessional } from "@/lib/agenda-types";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Profissionais — ClinicFlow",
};

export default async function ProfissionaisPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser || !["recepcionista", "gestor"].includes(currentUser.role)) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center gap-2 py-16 text-center">
          <ShieldAlert className="text-muted-foreground size-8" />
          <p className="text-foreground text-sm font-medium">Acesso restrito</p>
          <p className="text-muted-foreground max-w-sm text-sm">
            Só recepcionistas e gestores podem gerenciar os profissionais da clínica.
          </p>
        </CardContent>
      </Card>
    );
  }

  const professionals = await prisma.professional.findMany({
    where: { clinicId: currentUser.clinicId },
    orderBy: { name: "asc" },
  });

  return <ProfissionaisView initialProfessionals={professionals.map(mapProfessional)} />;
}
