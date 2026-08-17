"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { getPatientPaymentsTrend } from "@/lib/financeiro-types";
import { formatCurrency } from "@/lib/utils";

const chartConfig = {
  amount: { label: "Pagamento", theme: { light: "#10b981", dark: "#34d399" } },
} satisfies ChartConfig;

export function PatientPaymentsChart({
  payments,
}: {
  payments: ReturnType<typeof getPatientPaymentsTrend>;
}) {
  if (payments.length === 0) {
    return (
      <div className="text-muted-foreground flex h-64 items-center justify-center text-center text-sm">
        Nenhum pagamento registrado para este paciente ainda.
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
      <BarChart data={payments} margin={{ top: 16 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={24} />
        <ChartTooltip
          content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} />}
        />
        <Bar dataKey="amount" fill="var(--color-amount)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
