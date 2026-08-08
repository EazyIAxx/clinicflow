"use client";

import { isSameMonth } from "date-fns";
import { useState } from "react";

import { PacientesTable } from "@/components/pacientes/pacientes-table";
import { PacientesToolbar } from "@/components/pacientes/pacientes-toolbar";
import { PatientFormDialog } from "@/components/pacientes/patient-form-dialog";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Patient } from "@/lib/mock-pacientes";
import type { PatientStatus } from "@/lib/patient-status";

export function PacientesView({
  initialPatients,
  referenceDate,
}: {
  initialPatients: Patient[];
  referenceDate: Date;
}) {
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PatientStatus | "todos">("todos");
  const [professionalFilter, setProfessionalFilter] = useState("todos");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogKey, setDialogKey] = useState(0);
  const [editingPatient, setEditingPatient] = useState<Patient | undefined>(undefined);

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch = patient.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "todos" || patient.status === statusFilter;
    const matchesProfessional =
      professionalFilter === "todos" || patient.responsibleProfessionalId === professionalFilter;
    return matchesSearch && matchesStatus && matchesProfessional;
  });

  const activeCount = patients.filter((patient) => patient.status === "ativo").length;
  const newThisMonthCount = patients.filter((patient) =>
    isSameMonth(new Date(`${patient.createdAt}T00:00:00`), referenceDate),
  ).length;

  function openNewPatientDialog() {
    setEditingPatient(undefined);
    setDialogKey((key) => key + 1);
    setIsDialogOpen(true);
  }

  function openEditPatientDialog(patient: Patient) {
    setEditingPatient(patient);
    setDialogKey((key) => key + 1);
    setIsDialogOpen(true);
  }

  function handleSubmit(patient: Patient) {
    setPatients((prev) => {
      const exists = prev.some((existing) => existing.id === patient.id);
      return exists
        ? prev.map((existing) => (existing.id === patient.id ? patient : existing))
        : [...prev, patient];
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Pacientes cadastrados</CardDescription>
            <CardTitle className="text-2xl">{patients.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Ativos</CardDescription>
            <CardTitle className="text-2xl">{activeCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Novos este mês</CardDescription>
            <CardTitle className="text-2xl">{newThisMonthCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="flex flex-col gap-4">
        <PacientesToolbar
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          professionalFilter={professionalFilter}
          onProfessionalFilterChange={setProfessionalFilter}
          onNewPatient={openNewPatientDialog}
        />
        <PacientesTable patients={filteredPatients} onEdit={openEditPatientDialog} />
      </div>

      <PatientFormDialog
        key={`patient-form-${dialogKey}`}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        patient={editingPatient}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
