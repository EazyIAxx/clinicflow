"use client";

import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { ExpenseCategory, getExpensesByCategory } from "@/lib/mock-financeiro";
import { formatCurrency } from "@/lib/utils";

const categoryColors: Record<ExpenseCategory, { light: string; dark: string }> = {
  Aluguel: { light: "#3b82f6", dark: "#60a5fa" },
  Salários: { light: "#8b5cf6", dark: "#a78bfa" },
  Fornecedores: { light: "#f59e0b", dark: "#fbbf24" },
  Marketing: { light: "#f43f5e", dark: "#fb7185" },
  Utilidades: { light: "#06b6d4", dark: "#22d3ee" },
  Outros: { light: "#94a3b8", dark: "#94a3b8" },
};

const chartConfig: ChartConfig = Object.fromEntries(
  (Object.keys(categoryColors) as ExpenseCategory[]).map((category) => [
    category,
    { label: category, theme: categoryColors[category] },
  ]),
) satisfies ChartConfig;

export function ExpensesByCategoryChart({
  breakdown,
}: {
  breakdown: ReturnType<typeof getExpensesByCategory>;
}) {
  const data = breakdown.map((entry) => ({
    category: entry.category,
    total: entry.total,
    fill: `var(--color-${entry.category})`,
  }));

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
      <BarChart data={data} margin={{ top: 16 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="category" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={24} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              nameKey="category"
              hideLabel
              formatter={(value) => formatCurrency(Number(value))}
            />
          }
        />
        <Bar dataKey="total" radius={4}>
          {data.map((entry) => (
            <Cell key={entry.category} fill={entry.fill} />
          ))}
          <LabelList
            dataKey="total"
            position="top"
            className="fill-foreground text-xs"
            formatter={(value: unknown) => formatCurrency(Number(value))}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
