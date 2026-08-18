import { Handshake, PackageX, Receipt } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { getModulePendencies } from "@/lib/dashboard-metrics";

export function ModulePendenciesCard({
  pendencies,
}: {
  pendencies: ReturnType<typeof getModulePendencies>;
}) {
  const rows = [
    {
      key: "budgets",
      label: "Orçamentos aguardando aprovação",
      count: pendencies.pendingBudgets.length,
      href: "/orcamentos",
      icon: Receipt,
    },
    {
      key: "stock",
      label: "Itens de estoque crítico",
      count: pendencies.criticalStockItems.length,
      href: "/estoque",
      icon: PackageX,
    },
    {
      key: "leads",
      label: "Leads sem retorno",
      count: pendencies.staleLeads.length,
      href: "/crm",
      icon: Handshake,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pendências entre módulos</CardTitle>
        <CardDescription>O que precisa de atenção agora.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col divide-y">
        {rows.map((row) => (
          <Link
            key={row.key}
            href={row.href}
            className="hover:bg-muted/50 -mx-2 flex items-center justify-between gap-3 rounded-md px-2 py-2.5 text-sm transition-colors"
          >
            <span className="flex items-center gap-2">
              <row.icon className="text-muted-foreground size-4" />
              {row.label}
            </span>
            {row.count > 0 ? (
              <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400">
                {row.count}
              </Badge>
            ) : (
              <span className="text-muted-foreground text-xs">Tudo em dia</span>
            )}
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
