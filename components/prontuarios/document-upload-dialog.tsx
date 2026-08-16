"use client";

import { Upload } from "lucide-react";
import { useState, type ChangeEvent, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { uploadDocument } from "@/lib/actions/documents";
import {
  documentCategories,
  documentCategoryMeta,
  type DocumentCategory,
} from "@/lib/document-access";
import { formatFileSize, type Patient, type PatientDocument } from "@/lib/patient-types";

export function DocumentUploadDialog({
  open,
  onOpenChange,
  patients,
  fixedPatientId,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patients: Patient[];
  fixedPatientId?: string;
  onSubmit: (document: PatientDocument) => void;
}) {
  const [patientId, setPatientId] = useState(fixedPatientId ?? patients[0]?.id ?? "");
  const [category, setCategory] = useState<DocumentCategory>("exame");
  const [file, setFile] = useState<File>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  const fixedPatient = fixedPatientId
    ? patients.find((patient) => patient.id === fixedPatientId)
    : undefined;

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    if (!selected) return;
    setFile(selected);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!patientId || !file) return;
    setIsSubmitting(true);
    setError(undefined);

    const result = await uploadDocument({ patientId, category, file });

    setIsSubmitting(false);

    if (result.error || !result.data) {
      setError(result.error ?? "Não foi possível enviar o arquivo. Tente novamente.");
      return;
    }

    onSubmit(result.data);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar documento</DialogTitle>
          <DialogDescription>
            Faça upload de um exame, receita, atestado ou outro documento do paciente.
          </DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <Label>Paciente</Label>
            {fixedPatient ? (
              <div className="border-input bg-muted/40 text-muted-foreground rounded-md border px-3 py-2 text-sm">
                {fixedPatient.name}
              </div>
            ) : (
              <Select value={patientId} onValueChange={(value) => setPatientId(value as string)}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(value: string) =>
                      patients.find((patient) => patient.id === value)?.name ??
                      "Selecionar paciente"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Categoria</Label>
            <Select
              value={category}
              onValueChange={(value) => setCategory(value as DocumentCategory)}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(value: string) => documentCategoryMeta[value as DocumentCategory].label}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {documentCategories.map((option) => (
                  <SelectItem key={option} value={option}>
                    {documentCategoryMeta[option].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="document-file">Arquivo</Label>
            <label
              htmlFor="document-file"
              className="border-input hover:bg-muted/40 flex cursor-pointer flex-col items-center gap-1.5 rounded-md border border-dashed px-3 py-6 text-center text-sm transition-colors"
            >
              <Upload className="text-muted-foreground size-5" />
              {file ? (
                <span className="font-medium">
                  {file.name}{" "}
                  <span className="text-muted-foreground">({formatFileSize(file.size)})</span>
                </span>
              ) : (
                <span className="text-muted-foreground">Clique para selecionar um arquivo</span>
              )}
              <input
                id="document-file"
                type="file"
                className="sr-only"
                onChange={handleFileChange}
                required
              />
            </label>
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting || !patientId || !file}>
              {isSubmitting ? "Enviando..." : "Adicionar documento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
