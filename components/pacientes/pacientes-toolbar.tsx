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
import type { Professional } from "@/lib/agenda-types";
import { patientStatusMeta, type PatientStatus } from "@/lib/patient-status";

export function PacientesToolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  professionalFilter,
  onProfessionalFilterChange,
  professionals,
  onNewPatient,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: PatientStatus | "todos";
  onStatusFilterChange: (value: PatientStatus | "todos") => void;
  professionalFilter: string;
  onProfessionalFilterChange: (value: string) => void;
  professionals: Professional[];
  onNewPatient: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
        <div className="relative w-full sm:w-auto">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar paciente..."
            className="w-full pl-8 sm:w-56"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) => onStatusFilterChange(value as PatientStatus | "todos")}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue>
              {(value: string) =>
                value === "todos"
                  ? "Todos os status"
                  : patientStatusMeta[value as PatientStatus].label
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            {Object.entries(patientStatusMeta).map(([value, meta]) => (
              <SelectItem key={value} value={value}>
                {meta.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={professionalFilter}
          onValueChange={(value) => onProfessionalFilterChange(value as string)}
        >
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue>
              {(value: string) =>
                value === "todos"
                  ? "Todos os profissionais"
                  : (professionals.find((professional) => professional.id === value)?.name ?? value)
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os profissionais</SelectItem>
            {professionals.map((professional) => (
              <SelectItem key={professional.id} value={professional.id}>
                {professional.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button onClick={onNewPatient}>
        <Plus />
        Novo paciente
      </Button>
    </div>
  );
}
