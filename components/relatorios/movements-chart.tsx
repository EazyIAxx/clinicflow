"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { getMovementsTrend } from "@/lib/relatorios";

const chartConfig = {
  entrada: { label: "Entrada", theme: { light: "#10b981", dark: "#34d399" } },
  saida: { label: "Saída", theme: { light: "#3b82f6", dark: "#60a5fa" } },
} satisfies ChartConfig;

export function MovementsChart({ trend }: { trend: ReturnType<typeof getMovementsTrend> }) {
  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
      <BarChart data={trend} margin={{ top: 16 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} interval={1} />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={24} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="entrada" fill="var(--color-entrada)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="saida" fill="var(--color-saida)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
