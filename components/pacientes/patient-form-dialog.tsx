"use client";

import { format } from "date-fns";
import { useState, type FormEvent } from "react";

import { DatePicker } from "@/components/shared/date-picker";
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
import { Textarea } from "@/components/ui/textarea";
import { professionals } from "@/lib/mock-agenda";
import { deriveInitials, type Patient } from "@/lib/mock-pacientes";
import { patientStatusMeta, type PatientStatus } from "@/lib/patient-status";

const NONE_PROFESSIONAL = "nenhum";

export function PatientFormDialog({
  open,
  onOpenChange,
  patient,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient?: Patient;
  onSubmit: (patient: Patient) => void;
}) {
  const isEditing = Boolean(patient);

  const [name, setName] = useState(patient?.name ?? "");
  const [birthDate, setBirthDate] = useState<Date | undefined>(
    patient?.birthDate ? new Date(`${patient.birthDate}T00:00:00`) : undefined,
  );
  const [phone, setPhone] = useState(patient?.phone ?? "");
  const [email, setEmail] = useState(patient?.email ?? "");
  const [cpf, setCpf] = useState(patient?.cpf ?? "");
  const [responsibleProfessionalId, setResponsibleProfessionalId] = useState(
    patient?.responsibleProfessionalId ?? NONE_PROFESSIONAL,
  );
  const [status, setStatus] = useState<PatientStatus>(patient?.status ?? "ativo");
  const [notes, setNotes] = useState(patient?.notes ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const now = format(new Date(), "yyyy-MM-dd");

    onSubmit({
      id: patient?.id ?? crypto.randomUUID(),
      name,
      initials: deriveInitials(name),
      birthDate: birthDate ? format(birthDate, "yyyy-MM-dd") : (patient?.birthDate ?? now),
      phone,
      email: email || undefined,
      cpf: cpf || undefined,
      responsibleProfessionalId:
        responsibleProfessionalId === NONE_PROFESSIONAL ? undefined : responsibleProfessionalId,
      status,
      notes: notes || undefined,
      createdAt: patient?.createdAt ?? now,
      lastVisitAt: patient?.lastVisitAt,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar paciente" : "Novo paciente"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize os dados cadastrais do paciente."
              : "Cadastre um novo paciente da clínica."}
          </DialogDescription>
        </DialogHeader>

        <form className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="patient-name">Nome</Label>
            <Input
              id="patient-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex.: Larissa Fernandes"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Data de nascimento</Label>
              <DatePicker
                date={birthDate}
                onDateChange={setBirthDate}
                placeholder="Selecionar"
                className="w-full"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="patient-phone">Telefone</Label>
              <Input
                id="patient-phone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="(11) 90000-0000"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="patient-email">E-mail</Label>
              <Input
                id="patient-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Opcional"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="patient-cpf">CPF</Label>
              <Input
                id="patient-cpf"
                value={cpf}
                onChange={(event) => setCpf(event.target.value)}
                placeholder="Opcional"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Profissional responsável</Label>
              <Select
                value={responsibleProfessionalId}
                onValueChange={(value) => setResponsibleProfessionalId(value as string)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(value: string) =>
                      value === NONE_PROFESSIONAL
                        ? "Nenhum"
                        : (professionals.find((professional) => professional.id === value)?.name ??
                          value)
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_PROFESSIONAL}>Nenhum</SelectItem>
                  {professionals.map((professional) => (
                    <SelectItem key={professional.id} value={professional.id}>
                      {professional.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as PatientStatus)}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(value: string) => patientStatusMeta[value as PatientStatus].label}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(patientStatusMeta).map(([value, meta]) => (
                    <SelectItem key={value} value={value}>
                      {meta.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="patient-notes">Observações</Label>
            <Textarea
              id="patient-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Alergias, convênio, preferências de horário..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isEditing ? "Salvar alterações" : "Cadastrar paciente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
