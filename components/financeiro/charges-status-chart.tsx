"use client";

import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { chargeStatusMeta, type ChargeDisplayStatus } from "@/lib/finance-status";
import type { getChargesStatusBreakdown } from "@/lib/financeiro-types";

const statusColors: Record<ChargeDisplayStatus, { light: string; dark: string }> = {
  pendente: { light: "#f59e0b", dark: "#fbbf24" },
  atrasado: { light: "#ef4444", dark: "#f87171" },
  pago: { light: "#10b981", dark: "#34d399" },
  cancelado: { light: "#94a3b8", dark: "#94a3b8" },
};

const chartConfig: ChartConfig = Object.fromEntries(
  (Object.keys(chargeStatusMeta) as ChargeDisplayStatus[]).map((status) => [
    status,
    { label: chargeStatusMeta[status].label, theme: statusColors[status] },
  ]),
) satisfies ChartConfig;

export function ChargesStatusChart({
  breakdown,
}: {
  breakdown: ReturnType<typeof getChargesStatusBreakdown>;
}) {
  const data = breakdown.map((entry) => ({
    status: entry.status,
    label: chargeStatusMeta[entry.status].label,
    count: entry.count,
    fill: `var(--color-${entry.status})`,
  }));

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
      <BarChart data={data} margin={{ top: 16 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={24} />
        <ChartTooltip content={<ChartTooltipContent nameKey="status" hideLabel />} />
        <Bar dataKey="count" radius={4}>
          {data.map((entry) => (
            <Cell key={entry.status} fill={entry.fill} />
          ))}
          <LabelList dataKey="count" position="top" className="fill-foreground text-xs" />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
