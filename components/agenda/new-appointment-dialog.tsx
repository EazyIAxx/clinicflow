"use client";

import { useState, type FormEvent } from "react";

import { AgendaDatePicker } from "@/components/agenda/agenda-date-picker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDateKey, generateTimeSlots } from "@/lib/agenda-time";
import type { Appointment, Professional } from "@/lib/mock-agenda";

const serviceOptions = [
  "Consulta de rotina",
  "Retorno",
  "Avaliação inicial",
  "Procedimento",
  "Emergência",
];

const durationOptions: { value: string; label: string; minutes: 30 | 60 | 90 }[] = [
  { value: "30", label: "30 minutos", minutes: 30 },
  { value: "60", label: "1 hora", minutes: 60 },
  { value: "90", label: "1h30", minutes: 90 },
];

export type NewAppointmentDefaults = {
  professionalId?: string;
  date?: Date;
  time?: string;
};

export function NewAppointmentDialog({
  open,
  onOpenChange,
  professionals,
  defaults,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  professionals: Professional[];
  defaults?: NewAppointmentDefaults;
  onCreate: (appointment: Appointment) => void;
}) {
  const timeSlots = generateTimeSlots();

  // O pai remonta este componente (via `key`) toda vez que o dialog é aberto,
  // então os valores iniciais abaixo já nascem corretos — sem precisar de um
  // efeito para "resetar" o formulário.
  const [kind, setKind] = useState<"consulta" | "bloqueio">("consulta");
  const [professionalId, setProfessionalId] = useState(
    defaults?.professionalId && defaults.professionalId !== "todos"
      ? defaults.professionalId
      : (professionals[0]?.id ?? ""),
  );
  const [date, setDate] = useState<Date>(defaults?.date ?? new Date());
  const [startTime, setStartTime] = useState(defaults?.time ?? timeSlots[0]);
  const [duration, setDuration] = useState<30 | 60 | 90>(30);
  const [patientName, setPatientName] = useState("");
  const [service, setService] = useState(serviceOptions[0]);
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const base = {
      id: crypto.randomUUID(),
      professionalId,
      date: formatDateKey(date),
      startTime,
      durationMinutes: duration,
    } as const;

    const appointment: Appointment =
      kind === "consulta"
        ? {
            ...base,
            status: "confirmada",
            kind: "consulta",
            patientName,
            service,
            notes: notes || undefined,
          }
        : { ...base, status: "bloqueio", kind: "bloqueio", reason: reason || "Bloqueio" };

    onCreate(appointment);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo agendamento</DialogTitle>
          <DialogDescription>
            Crie uma consulta ou bloqueie um horário na agenda de um profissional.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2">
          <Button
            type="button"
            variant={kind === "consulta" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setKind("consulta")}
          >
            Consulta
          </Button>
          <Button
            type="button"
            variant={kind === "bloqueio" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setKind("bloqueio")}
          >
            Bloqueio de horário
          </Button>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {kind === "consulta" && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="patient-name">Paciente</Label>
              <Input
                id="patient-name"
                value={patientName}
                onChange={(event) => setPatientName(event.target.value)}
                placeholder="Nome do paciente"
                required
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Profissional</Label>
              <Select
                value={professionalId}
                onValueChange={(value) => setProfessionalId(value as string)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(value: string) =>
                      professionals.find((professional) => professional.id === value)?.name
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {professionals.map((professional) => (
                    <SelectItem key={professional.id} value={professional.id}>
                      {professional.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Sala</Label>
              <Input
                value={
                  professionals.find((professional) => professional.id === professionalId)?.room ??
                  ""
                }
                disabled
                readOnly
              />
            </div>
          </div>

          {kind === "consulta" && (
            <div className="flex flex-col gap-1.5">
              <Label>Tipo de consulta</Label>
              <Select value={service} onValueChange={(value) => setService(value as string)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {serviceOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {kind === "bloqueio" && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="block-reason">Motivo</Label>
              <Input
                id="block-reason"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Ex.: Almoço, reunião de equipe"
                required
              />
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1 flex flex-col gap-1.5">
              <Label>Data</Label>
              <AgendaDatePicker date={date} onDateChange={setDate} className="w-full" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Horário</Label>
              <Select value={startTime} onValueChange={(value) => setStartTime(value as string)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Duração</Label>
              <Select
                value={String(duration)}
                onValueChange={(value) => setDuration(Number(value) as 30 | 60 | 90)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(value: string) =>
                      durationOptions.find((option) => option.value === value)?.label
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {durationOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {kind === "consulta" && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="notes">Observações</Label>
              <textarea
                id="notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={3}
                className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-lg border bg-transparent px-2.5 py-1.5 text-sm outline-none focus-visible:ring-3"
                placeholder="Observações sobre a consulta (opcional)"
              />
            </div>
          )}

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {kind === "consulta" ? "Agendar consulta" : "Bloquear horário"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
