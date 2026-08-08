"use client";

import { differenceInCalendarDays } from "date-fns";
import { useMemo, useState } from "react";

import { DocumentAccessLegend } from "@/components/prontuarios/document-access-legend";
import { DocumentUploadDialog } from "@/components/prontuarios/document-upload-dialog";
import { DocumentsGrid } from "@/components/prontuarios/documents-grid";
import { ProntuariosToolbar } from "@/components/prontuarios/prontuarios-toolbar";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DocumentCategory } from "@/lib/document-access";
import type { PatientDocument } from "@/lib/mock-documentos";
import type { Patient } from "@/lib/mock-pacientes";

export function ProntuariosView({
  initialDocuments,
  patients,
  referenceDate,
}: {
  initialDocuments: PatientDocument[];
  patients: Patient[];
  referenceDate: Date;
}) {
  const [documents, setDocuments] = useState<PatientDocument[]>(initialDocuments);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<DocumentCategory | "todas">("todas");
  const [patientFilter, setPatientFilter] = useState("todos");

  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadDialogKey, setUploadDialogKey] = useState(0);

  const patientsById = useMemo(
    () => Object.fromEntries(patients.map((patient) => [patient.id, patient])),
    [patients],
  );
  const getPatientName = (patientId: string) => patientsById[patientId]?.name;

  const filteredDocuments = documents.filter((document) => {
    const query = search.toLowerCase();
    const matchesSearch =
      document.name.toLowerCase().includes(query) ||
      (getPatientName(document.patientId)?.toLowerCase().includes(query) ?? false);
    const matchesCategory = categoryFilter === "todas" || document.category === categoryFilter;
    const matchesPatient = patientFilter === "todos" || document.patientId === patientFilter;
    return matchesSearch && matchesCategory && matchesPatient;
  });

  const addedThisWeekCount = documents.filter((document) => {
    const days = differenceInCalendarDays(
      referenceDate,
      new Date(`${document.uploadedAt}T00:00:00`),
    );
    return days >= 0 && days <= 6;
  }).length;

  function openUploadDialog() {
    setUploadDialogKey((key) => key + 1);
    setIsUploadDialogOpen(true);
  }

  function handleRemoveDocument(document: PatientDocument) {
    setDocuments((prev) => prev.filter((existing) => existing.id !== document.id));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardDescription>Documentos armazenados</CardDescription>
            <CardTitle className="text-2xl">{documents.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Adicionados esta semana</CardDescription>
            <CardTitle className="text-2xl">{addedThisWeekCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="flex flex-col gap-4">
        <ProntuariosToolbar
          search={search}
          onSearchChange={setSearch}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          patientFilter={patientFilter}
          onPatientFilterChange={setPatientFilter}
          patients={patients}
          onNewDocument={openUploadDialog}
        />
        <DocumentAccessLegend />
        <DocumentsGrid
          documents={filteredDocuments}
          onRemove={handleRemoveDocument}
          getPatientName={getPatientName}
          emptyMessage="Nenhum documento encontrado."
        />
      </div>

      <DocumentUploadDialog
        key={`document-upload-${uploadDialogKey}`}
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        patients={patients}
        onSubmit={(document) => setDocuments((prev) => [...prev, document])}
      />
    </div>
  );
}
