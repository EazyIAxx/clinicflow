"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { PatientFormDialog } from "@/components/pacientes/patient-form-dialog";
import { PatientProfileHeader } from "@/components/pacientes/patient-profile-header";
import { DocumentAccessLegend } from "@/components/prontuarios/document-access-legend";
import { DocumentUploadDialog } from "@/components/prontuarios/document-upload-dialog";
import { DocumentsGrid } from "@/components/prontuarios/documents-grid";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { PatientDocument } from "@/lib/mock-documentos";
import { responsibleProfessionalName, type Patient } from "@/lib/mock-pacientes";

const formatDate = (date?: string) => (date ? date.split("-").reverse().join("/") : "—");

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b py-1.5 last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

export function PatientProfileView({
  initialPatient,
  initialDocuments,
  referenceDate,
}: {
  initialPatient: Patient;
  initialDocuments: PatientDocument[];
  referenceDate: Date;
}) {
  const [patient, setPatient] = useState(initialPatient);
  const [documents, setDocuments] = useState(initialDocuments);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editDialogKey, setEditDialogKey] = useState(0);

  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadDialogKey, setUploadDialogKey] = useState(0);

  function openEditDialog() {
    setEditDialogKey((key) => key + 1);
    setIsEditDialogOpen(true);
  }

  function openUploadDialog() {
    setUploadDialogKey((key) => key + 1);
    setIsUploadDialogOpen(true);
  }

  function handleRemoveDocument(document: PatientDocument) {
    setDocuments((prev) => prev.filter((existing) => existing.id !== document.id));
  }

  return (
    <div className="flex flex-col gap-4">
      <PatientProfileHeader
        patient={patient}
        referenceDate={referenceDate}
        onEdit={openEditDialog}
      />

      <Tabs defaultValue="visao-geral">
        <TabsList>
          <TabsTrigger value="visao-geral">Visão geral</TabsTrigger>
          <TabsTrigger value="documentos">Documentos ({documents.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="visao-geral" className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Dados cadastrais</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col text-sm">
              <DataRow label="Nascimento" value={formatDate(patient.birthDate)} />
              <DataRow label="Telefone" value={patient.phone} />
              <DataRow label="E-mail" value={patient.email ?? "—"} />
              <DataRow label="CPF" value={patient.cpf ?? "—"} />
              <DataRow
                label="Profissional responsável"
                value={responsibleProfessionalName(patient) ?? "—"}
              />
              <DataRow label="Cadastrado em" value={formatDate(patient.createdAt)} />
              <DataRow label="Última visita" value={formatDate(patient.lastVisitAt)} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Observações</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              {patient.notes ? (
                <p>{patient.notes}</p>
              ) : (
                <p className="text-muted-foreground">Nenhuma observação registrada.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentos" className="mt-4 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <DocumentAccessLegend />
            <Button onClick={openUploadDialog}>
              <Plus />
              Adicionar documento
            </Button>
          </div>
          <DocumentsGrid
            documents={documents}
            onRemove={handleRemoveDocument}
            emptyMessage="Esse paciente ainda não tem documentos."
          />
        </TabsContent>
      </Tabs>

      <PatientFormDialog
        key={`patient-edit-${editDialogKey}`}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        patient={patient}
        onSubmit={setPatient}
      />

      <DocumentUploadDialog
        key={`document-upload-${uploadDialogKey}`}
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        patients={[patient]}
        fixedPatientId={patient.id}
        onSubmit={(document) => setDocuments((prev) => [...prev, document])}
      />
    </div>
  );
}
