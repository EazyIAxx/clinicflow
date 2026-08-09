"use client";

import { CategoryChart } from "@/components/relatorios/category-chart";
import { ExportMenu } from "@/components/relatorios/export-menu";
import { MovementsChart } from "@/components/relatorios/movements-chart";
import { StatusChart } from "@/components/relatorios/status-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Appointment } from "@/lib/mock-agenda";
import type { PatientDocument } from "@/lib/mock-documentos";
import type { StockItem, StockMovement } from "@/lib/mock-estoque";
import type { Patient } from "@/lib/mock-pacientes";
import {
  getAppointmentStatusBreakdown,
  getMovementsTrend,
  getReportStats,
  getStockCategoryBreakdown,
} from "@/lib/relatorios";

export function RelatoriosView({
  appointments,
  items,
  movements,
  patients,
  documents,
  referenceDate,
}: {
  appointments: Appointment[];
  items: StockItem[];
  movements: StockMovement[];
  patients: Patient[];
  documents: PatientDocument[];
  referenceDate: Date;
}) {
  const stats = getReportStats({ appointments, items, documents, patients, referenceDate });
  const statusBreakdown = getAppointmentStatusBreakdown(appointments);
  const movementsTrend = getMovementsTrend(movements, referenceDate, 14);
  const categoryBreakdown = getStockCategoryBreakdown(items);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm">
          Métricas consolidadas de agenda, estoque e prontuário.
        </p>
        <ExportMenu appointments={appointments} items={items} patients={patients} />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardHeader>
            <CardDescription>Consultas no mês</CardDescription>
            <CardTitle className="text-2xl">{stats.appointmentsThisMonth}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Taxa de confirmação</CardDescription>
            <CardTitle className="text-2xl">{stats.confirmationRate}%</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Abaixo do mínimo</CardDescription>
            <CardTitle className="text-2xl">{stats.lowStockCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Vencendo ou vencidos</CardDescription>
            <CardTitle className="text-2xl">{stats.expiringCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Documentos essa semana</CardDescription>
            <CardTitle className="text-2xl">{stats.documentsThisWeek}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Pacientes ativos</CardDescription>
            <CardTitle className="text-2xl">{stats.activePatients}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Consultas por status</CardTitle>
            <CardDescription>Distribuição das consultas cadastradas na agenda.</CardDescription>
          </CardHeader>
          <CardContent>
            <StatusChart breakdown={statusBreakdown} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Movimentações de estoque</CardTitle>
            <CardDescription>Entradas e saídas nos últimos 14 dias.</CardDescription>
          </CardHeader>
          <CardContent>
            <MovementsChart trend={movementsTrend} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Itens de estoque por categoria</CardTitle>
          <CardDescription>Quantidade de itens cadastrados em cada categoria.</CardDescription>
        </CardHeader>
        <CardContent>
          <CategoryChart breakdown={categoryBreakdown} />
        </CardContent>
      </Card>
    </div>
  );
}
