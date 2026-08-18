"use client";

import { pdf } from "@react-pdf/renderer";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Download, FileText } from "lucide-react";

import { RelatorioPdfDocument } from "@/components/relatorios/relatorio-pdf";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { statusMeta, type AppointmentStatus } from "@/lib/agenda-status";
import type { Appointment, Professional } from "@/lib/agenda-types";
import { categoryLabels, type StockItem } from "@/lib/estoque-types";
import { patientStatusMeta } from "@/lib/patient-status";
import type { Patient } from "@/lib/patient-types";

function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const escape = (value: string | number) => {
    const text = String(value);
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const csv = [headers, ...rows].map((row) => row.map(escape).join(",")).join("\n");
  const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function ExportMenu({
  appointments,
  items,
  patients,
  professionals,
  stats,
  statusBreakdown,
  categoryBreakdown,
}: {
  appointments: Appointment[];
  items: StockItem[];
  patients: Patient[];
  professionals: Professional[];
  stats: {
    appointmentsThisMonth: number;
    confirmationRate: number;
    lowStockCount: number;
    expiringCount: number;
    documentsThisWeek: number;
    activePatients: number;
  };
  statusBreakdown: { status: AppointmentStatus; count: number }[];
  categoryBreakdown: { label: string; count: number }[];
}) {
  const professionalsById = Object.fromEntries(
    professionals.map((professional) => [professional.id, professional]),
  );

  function exportAgenda() {
    downloadCsv(
      "agenda.csv",
      ["Data", "Horário", "Status", "Paciente", "Serviço"],
      appointments
        .filter((appointment) => appointment.kind === "consulta")
        .map((appointment) => [
          appointment.date,
          appointment.startTime,
          statusMeta[appointment.status].label,
          appointment.patientName ?? "",
          appointment.service ?? "",
        ]),
    );
  }

  function exportEstoque() {
    downloadCsv(
      "estoque.csv",
      ["Nome", "Categoria", "Quantidade", "Mínimo", "Validade"],
      items.map((item) => [
        item.name,
        categoryLabels[item.category],
        item.quantity,
        item.minQuantity,
        item.expiresAt ?? "",
      ]),
    );
  }

  function exportPacientes() {
    downloadCsv(
      "pacientes.csv",
      ["Nome", "Telefone", "Profissional responsável", "Status", "Última visita"],
      patients.map((patient) => [
        patient.name,
        patient.phone,
        (patient.responsibleProfessionalId &&
          professionalsById[patient.responsibleProfessionalId]?.name) ??
          "",
        patientStatusMeta[patient.status].label,
        patient.lastVisitAt ?? "",
      ]),
    );
  }

  async function exportPdf() {
    const generatedAt = format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    const blob = await pdf(
      <RelatorioPdfDocument
        generatedAt={generatedAt}
        stats={stats}
        statusBreakdown={statusBreakdown}
        categoryBreakdown={categoryBreakdown}
      />,
    ).toBlob();
    downloadBlob("relatorio-clinicflow.pdf", blob);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" />}>
        <Download />
        Exportar
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportAgenda}>Agenda (CSV)</DropdownMenuItem>
        <DropdownMenuItem onClick={exportEstoque}>Estoque (CSV)</DropdownMenuItem>
        <DropdownMenuItem onClick={exportPacientes}>Pacientes (CSV)</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={exportPdf}>
          <FileText />
          Relatório completo (PDF)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
