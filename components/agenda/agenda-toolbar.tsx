import { Plus } from "lucide-react";

import { AgendaDatePicker } from "@/components/agenda/agenda-date-picker";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Professional } from "@/lib/agenda-types";

export type AgendaViewMode = "dia" | "semana";

export function AgendaToolbar({
  viewMode,
  onViewModeChange,
  date,
  onDateChange,
  professionals,
  selectedProfessionalId,
  onProfessionalChange,
  onNewAppointment,
  canManage,
}: {
  viewMode: AgendaViewMode;
  onViewModeChange: (mode: AgendaViewMode) => void;
  date: Date;
  onDateChange: (date: Date) => void;
  professionals: Professional[];
  selectedProfessionalId: string;
  onProfessionalChange: (id: string) => void;
  onNewAppointment: () => void;
  canManage: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
        <Tabs value={viewMode} onValueChange={(value) => onViewModeChange(value as AgendaViewMode)}>
          <TabsList>
            <TabsTrigger value="dia">Dia</TabsTrigger>
            <TabsTrigger value="semana">Semana</TabsTrigger>
          </TabsList>
        </Tabs>
        <AgendaDatePicker date={date} onDateChange={onDateChange} />
        <Select
          value={selectedProfessionalId}
          onValueChange={(value) => onProfessionalChange(value as string)}
        >
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue>
              {(value: string) =>
                value === "todos"
                  ? "Todos os profissionais"
                  : professionals.find((professional) => professional.id === value)?.name
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
      {canManage && (
        <Button onClick={onNewAppointment} disabled={professionals.length === 0}>
          <Plus />
          Novo agendamento
        </Button>
      )}
    </div>
  );
}
