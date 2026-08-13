"use client";

import { useState } from "react";

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
import { Textarea } from "@/components/ui/textarea";
import { resolveMessageTemplate, type AutomationRule } from "@/lib/mock-automacoes";
import type { Patient } from "@/lib/mock-pacientes";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export function SendWhatsAppDialog({
  open,
  onOpenChange,
  rule,
  patients,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule: AutomationRule | null;
  patients: Patient[];
}) {
  const [patientId, setPatientId] = useState(patients[0]?.id ?? "");
  const [message, setMessage] = useState(() =>
    rule && patients[0]
      ? resolveMessageTemplate(rule.action.message, patients[0], new Date())
      : (rule?.action.message ?? ""),
  );

  const patient = patients.find((candidate) => candidate.id === patientId);
  const waLink = patient ? buildWhatsAppLink(patient.phone, message) : "#";

  function handlePatientChange(value: string) {
    setPatientId(value);
    const nextPatient = patients.find((candidate) => candidate.id === value);
    if (rule && nextPatient) {
      setMessage(resolveMessageTemplate(rule.action.message, nextPatient, new Date()));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enviar mensagem</DialogTitle>
          <DialogDescription>
            {rule ? `Regra "${rule.name}"` : "Regra"} — escolha o paciente, revise a mensagem e abra
            o WhatsApp Web pra enviar.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Paciente</Label>
            <Select
              value={patientId}
              onValueChange={(value) => handlePatientChange(value as string)}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(value: string) =>
                    patients.find((candidate) => candidate.id === value)?.name ?? "Selecionar"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {patients.map((candidate) => (
                  <SelectItem key={candidate.id} value={candidate.id}>
                    {candidate.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {patient && (
              <p className="text-muted-foreground text-xs">Enviar para {patient.phone}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="whatsapp-message">Mensagem</Label>
            <Textarea
              id="whatsapp-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            nativeButton={false}
            render={<a href={waLink} target="_blank" rel="noopener noreferrer" />}
          >
            Abrir WhatsApp Web
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
