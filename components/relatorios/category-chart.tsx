"use client";

import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { getStockCategoryBreakdown } from "@/lib/relatorios";

const chartConfig = {
  count: { label: "Itens", theme: { light: "#059669", dark: "#10b981" } },
} satisfies ChartConfig;

export function CategoryChart({
  breakdown,
}: {
  breakdown: ReturnType<typeof getStockCategoryBreakdown>;
}) {
  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
      <BarChart data={breakdown} layout="vertical" margin={{ left: 8, right: 24 }}>
        <CartesianGrid horizontal={false} />
        <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} hide />
        <YAxis dataKey="label" type="category" tickLine={false} axisLine={false} width={130} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="count" fill="var(--color-count)" radius={4}>
          <LabelList dataKey="count" position="right" className="fill-foreground text-xs" />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
