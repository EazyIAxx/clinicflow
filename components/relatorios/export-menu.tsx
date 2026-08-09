"use client";

import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { statusMeta } from "@/lib/agenda-status";
import type { Appointment } from "@/lib/mock-agenda";
import { categoryLabels, type StockItem } from "@/lib/mock-estoque";
import { responsibleProfessionalName, type Patient } from "@/lib/mock-pacientes";
import { patientStatusMeta } from "@/lib/patient-status";

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

export function ExportMenu({
  appointments,
  items,
  patients,
}: {
  appointments: Appointment[];
  items: StockItem[];
  patients: Patient[];
}) {
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
        responsibleProfessionalName(patient) ?? "",
        patientStatusMeta[patient.status].label,
        patient.lastVisitAt ?? "",
      ]),
    );
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
