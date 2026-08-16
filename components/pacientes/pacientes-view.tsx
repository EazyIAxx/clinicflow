"use client";

import { isSameMonth } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

import { PacientesTable } from "@/components/pacientes/pacientes-table";
import { PacientesToolbar } from "@/components/pacientes/pacientes-toolbar";
import { PatientFormDialog } from "@/components/pacientes/patient-form-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { deletePatient } from "@/lib/actions/patients";
import type { Professional } from "@/lib/agenda-types";
import type { Patient } from "@/lib/patient-types";
import type { PatientStatus } from "@/lib/patient-status";

export function PacientesView({
  initialPatients,
  professionals,
  referenceDate,
}: {
  initialPatients: Patient[];
  professionals: Professional[];
  referenceDate: Date;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isDeleting, startDeleteTransition] = useTransition();

  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PatientStatus | "todos">("todos");
  const [professionalFilter, setProfessionalFilter] = useState("todos");

  // Convertendo um lead do CRM em paciente: a URL chega com ?novo=1&nome=...
  // já preenche e abre o formulário direto, sem precisar de efeito.
  const [isDialogOpen, setIsDialogOpen] = useState(() => searchParams.get("novo") === "1");
  const [dialogKey, setDialogKey] = useState(0);
  const [editingPatient, setEditingPatient] = useState<Patient | undefined>(undefined);
  const [prefillValues] = useState(() =>
    searchParams.get("novo") === "1"
      ? {
          name: searchParams.get("nome") ?? undefined,
          phone: searchParams.get("telefone") ?? undefined,
          email: searchParams.get("email") ?? undefined,
        }
      : undefined,
  );

  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);

  const professionalsById = Object.fromEntries(professionals.map((p) => [p.id, p]));

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
    router.refresh();
  }

  function handleConfirmDelete() {
    if (!patientToDelete) return;
    const id = patientToDelete.id;
    startDeleteTransition(async () => {
      await deletePatient(id);
      setPatients((prev) => prev.filter((existing) => existing.id !== id));
      router.refresh();
    });
    setPatientToDelete(null);
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
          professionals={professionals}
          onNewPatient={openNewPatientDialog}
        />
        <PacientesTable
          patients={filteredPatients}
          professionalsById={professionalsById}
          onEdit={openEditPatientDialog}
          onDelete={setPatientToDelete}
        />
      </div>

      <PatientFormDialog
        key={`patient-form-${dialogKey}`}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        patient={editingPatient}
        professionals={professionals}
        initialValues={editingPatient ? undefined : prefillValues}
        onSubmit={handleSubmit}
      />

      <AlertDialog
        open={Boolean(patientToDelete)}
        onOpenChange={(open) => !open && setPatientToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir paciente?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir &quot;{patientToDelete?.name}&quot;? Essa ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isDeleting}
              onClick={handleConfirmDelete}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
