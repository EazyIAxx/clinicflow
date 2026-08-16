import { ShieldAlert } from "lucide-react";
import type { Metadata } from "next";

import { EstoqueView } from "@/components/estoque/estoque-view";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { mapStockItem, mapStockMovement } from "@/lib/estoque-types";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Estoque — ClinicFlow",
};

// Os indicadores de validade precisam refletir a data real de cada acesso, não a do build.
export const dynamic = "force-dynamic";

export default async function EstoquePage() {
  const currentUser = await getCurrentUser();

  if (!currentUser || !["recepcionista", "gestor"].includes(currentUser.role)) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center gap-2 py-16 text-center">
          <ShieldAlert className="text-muted-foreground size-8" />
          <p className="text-foreground text-sm font-medium">Acesso restrito</p>
          <p className="text-muted-foreground max-w-sm text-sm">
            Só recepcionistas e gestores podem acessar o estoque da clínica.
          </p>
        </CardContent>
      </Card>
    );
  }

  const today = new Date();
  const canManage = currentUser.role === "gestor";

  const [itemRows, movementRows] = await Promise.all([
    prisma.stockItem.findMany({
      where: { clinicId: currentUser.clinicId },
      orderBy: { name: "asc" },
    }),
    prisma.stockMovement.findMany({
      where: { clinicId: currentUser.clinicId },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    }),
  ]);

  return (
    <EstoqueView
      initialItems={itemRows.map(mapStockItem)}
      initialMovements={movementRows.map(mapStockMovement)}
      referenceDate={today}
      canManage={canManage}
    />
  );
}
