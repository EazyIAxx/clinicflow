"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { getCashflowTrend } from "@/lib/financeiro-types";

const chartConfig = {
  revenue: { label: "Receita", theme: { light: "#10b981", dark: "#34d399" } },
  expense: { label: "Despesa", theme: { light: "#3b82f6", dark: "#60a5fa" } },
} satisfies ChartConfig;

// Legenda própria (em vez de <ChartLegend>): o Recharts não preserva a ordem
// de declaração dos <Bar> nem do ChartConfig no payload da legenda, então
// controlamos a ordem (Receita antes de Despesa) manualmente.
function CashflowLegend() {
  return (
    <div className="text-muted-foreground flex items-center justify-center gap-4 pt-3 text-xs">
      <span className="flex items-center gap-1.5">
        <span
          className="bg-primary size-2 rounded-[2px]"
          style={{ backgroundColor: "var(--color-revenue)" }}
        />
        Receita
      </span>
      <span className="flex items-center gap-1.5">
        <span
          className="size-2 rounded-[2px]"
          style={{ backgroundColor: "var(--color-expense)" }}
        />
        Despesa
      </span>
    </div>
  );
}

export function CashflowChart({ trend }: { trend: ReturnType<typeof getCashflowTrend> }) {
  return (
    <div>
      <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
        <BarChart data={trend} margin={{ top: 16 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} interval={1} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={24} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expense" fill="var(--color-expense)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>
      <CashflowLegend />
    </div>
  );
}
