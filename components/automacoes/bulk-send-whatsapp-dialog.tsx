"use client";

import { CheckCircle2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { resolveMessageTemplate, type AutomationRule } from "@/lib/mock-automacoes";
import type { Patient } from "@/lib/mock-pacientes";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export function BulkSendWhatsAppDialog({
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
  const [openedIds, setOpenedIds] = useState<Set<string>>(new Set());

  const targetPatients = (rule?.targetPatientIds ?? [])
    .map((id) => patients.find((patient) => patient.id === id))
    .filter((patient): patient is Patient => Boolean(patient));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enviar para {targetPatients.length} paciente(s)</DialogTitle>
          <DialogDescription>
            {rule ? `Regra "${rule.name}" salva. ` : ""}Clique em cada paciente para abrir o
            WhatsApp Web com a mensagem já preenchida.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col divide-y">
          {targetPatients.length === 0 && (
            <p className="text-muted-foreground py-6 text-center text-sm">
              Nenhum paciente selecionado.
            </p>
          )}
          {targetPatients.map((patient) => {
            const message = rule
              ? resolveMessageTemplate(rule.action.message, patient, new Date())
              : "";
            const waLink = buildWhatsAppLink(patient.phone, message);
            const isOpened = openedIds.has(patient.id);
            return (
              <div
                key={patient.id}
                className="flex items-center justify-between gap-3 py-2.5 text-sm"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{patient.name}</span>
                  <span className="text-muted-foreground text-xs">{patient.phone}</span>
                </div>
                <Button
                  variant={isOpened ? "outline" : "default"}
                  size="sm"
                  nativeButton={false}
                  render={<a href={waLink} target="_blank" rel="noopener noreferrer" />}
                  onClick={() => setOpenedIds((prev) => new Set(prev).add(patient.id))}
                >
                  {isOpened ? (
                    <>
                      <CheckCircle2 />
                      Aberto
                    </>
                  ) : (
                    "Abrir WhatsApp"
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
