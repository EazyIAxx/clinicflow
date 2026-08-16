import { Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  documentCategories,
  documentCategoryMeta,
  type DocumentCategory,
} from "@/lib/document-access";
import type { Patient } from "@/lib/patient-types";

export function ProntuariosToolbar({
  search,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  patientFilter,
  onPatientFilterChange,
  patients,
  onNewDocument,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  categoryFilter: DocumentCategory | "todas";
  onCategoryFilterChange: (value: DocumentCategory | "todas") => void;
  patientFilter: string;
  onPatientFilterChange: (value: string) => void;
  patients: Patient[];
  onNewDocument: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
        <div className="relative w-full sm:w-auto">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar documento ou paciente..."
            className="w-full pl-8 sm:w-64"
          />
        </div>
        <Select
          value={categoryFilter}
          onValueChange={(value) => onCategoryFilterChange(value as DocumentCategory | "todas")}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue>
              {(value: string) =>
                value === "todas"
                  ? "Todas as categorias"
                  : documentCategoryMeta[value as DocumentCategory].label
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as categorias</SelectItem>
            {documentCategories.map((category) => (
              <SelectItem key={category} value={category}>
                {documentCategoryMeta[category].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={patientFilter}
          onValueChange={(value) => onPatientFilterChange(value as string)}
        >
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue>
              {(value: string) =>
                value === "todos"
                  ? "Todos os pacientes"
                  : (patients.find((patient) => patient.id === value)?.name ?? value)
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os pacientes</SelectItem>
            {patients.map((patient) => (
              <SelectItem key={patient.id} value={patient.id}>
                {patient.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button onClick={onNewDocument}>
        <Plus />
        Novo documento
      </Button>
    </div>
  );
}
