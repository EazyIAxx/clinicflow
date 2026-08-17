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
import { chargeStatusMeta, type ChargeDisplayStatus } from "@/lib/finance-status";
import type { Patient } from "@/lib/patient-types";

const filterStatusOrder: ChargeDisplayStatus[] = ["pendente", "atrasado", "pago", "cancelado"];

export function ChargesToolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  patientFilter,
  onPatientFilterChange,
  patients,
  onNewCharge,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: ChargeDisplayStatus | "todos";
  onStatusFilterChange: (value: ChargeDisplayStatus | "todos") => void;
  patientFilter: string;
  onPatientFilterChange: (value: string) => void;
  patients: Patient[];
  onNewCharge: () => void;
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
          onValueChange={(value) => onStatusFilterChange(value as ChargeDisplayStatus | "todos")}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue>
              {(value: string) =>
                value === "todos"
                  ? "Todos os status"
                  : chargeStatusMeta[value as ChargeDisplayStatus].label
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            {filterStatusOrder.map((status) => (
              <SelectItem key={status} value={status}>
                {chargeStatusMeta[status].label}
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
      <Button onClick={onNewCharge}>
        <Plus />
        Nova cobrança
      </Button>
    </div>
  );
}
