"use client";

import { useState, type FormEvent } from "react";

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
import { createLead, updateLead } from "@/lib/actions/crm";
import type { Professional } from "@/lib/agenda-types";
import { originOptions, type Lead, type LeadOrigin } from "@/lib/crm-types";
import { leadStageMeta, leadStageOrder, type LeadStage } from "@/lib/lead-status";

const NONE_PROFESSIONAL = "nenhum";

export function LeadFormDialog({
  open,
  onOpenChange,
  lead,
  professionals,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead?: Lead;
  professionals: Professional[];
  onSubmit: (lead: Lead) => void;
}) {
  const isEditing = Boolean(lead);

  const [name, setName] = useState(lead?.name ?? "");
  const [phone, setPhone] = useState(lead?.phone ?? "");
  const [email, setEmail] = useState(lead?.email ?? "");
  const [origin, setOrigin] = useState<LeadOrigin>(lead?.origin ?? originOptions[0]);
  const [interest, setInterest] = useState(lead?.interest ?? "");
  const [responsibleProfessionalId, setResponsibleProfessionalId] = useState(
    lead?.responsibleProfessionalId ?? NONE_PROFESSIONAL,
  );
  const [stage, setStage] = useState<LeadStage>(lead?.stage ?? "novo");
  const [notes, setNotes] = useState(lead?.notes ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(undefined);

    const input = {
      name,
      phone,
      email: email || undefined,
      origin,
      interest,
      responsibleProfessionalId:
        responsibleProfessionalId === NONE_PROFESSIONAL ? undefined : responsibleProfessionalId,
      stage,
      notes: notes || undefined,
    };

    const result = lead ? await updateLead(lead.id, input) : await createLead(input);

    setIsSubmitting(false);

    if (result.error || !result.data) {
      setError(result.error ?? "Não foi possível salvar. Tente novamente.");
      return;
    }

    onSubmit(result.data);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar lead" : "Novo lead"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize os dados do lead."
              : "Cadastre uma pessoa interessada que ainda não é paciente."}
          </DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lead-name">Nome</Label>
            <Input
              id="lead-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex.: Bianca Ferreira"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="lead-phone">Telefone</Label>
              <Input
                id="lead-phone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="(11) 90000-0000"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="lead-email">E-mail</Label>
              <Input
                id="lead-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Opcional"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lead-interest">Interesse</Label>
            <Input
              id="lead-interest"
              value={interest}
              onChange={(event) => setInterest(event.target.value)}
              placeholder="Ex.: Avaliação dermatológica"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Origem</Label>
              <Select value={origin} onValueChange={(value) => setOrigin(value as LeadOrigin)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {originOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Etapa</Label>
              <Select value={stage} onValueChange={(value) => setStage(value as LeadStage)}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(value: string) => leadStageMeta[value as LeadStage].label}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {leadStageOrder.map((option) => (
                    <SelectItem key={option} value={option}>
                      {leadStageMeta[option].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

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
            <Label htmlFor="lead-notes">Observações</Label>
            <Textarea
              id="lead-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Contexto adicional sobre o lead..."
              rows={2}
            />
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : isEditing ? "Salvar alterações" : "Cadastrar lead"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
