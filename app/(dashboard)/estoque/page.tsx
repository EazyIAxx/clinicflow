import type { Metadata } from "next";

import { EstoqueView } from "@/components/estoque/estoque-view";
import { getMockMovements, getMockStockItems } from "@/lib/mock-estoque";

export const metadata: Metadata = {
  title: "Estoque — ClinicFlow",
};

// Os indicadores de validade precisam refletir a data real de cada acesso, não a do build.
export const dynamic = "force-dynamic";

export default function EstoquePage() {
  const today = new Date();
  const items = getMockStockItems(today);
  const movements = getMockMovements(today);

  return <EstoqueView initialItems={items} initialMovements={movements} referenceDate={today} />;
}
