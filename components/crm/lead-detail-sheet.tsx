"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  MessageCircle,
  Pencil,
  Phone,
  StickyNote,
  Trash2,
  UserCheck,
  type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { addLeadInteraction, convertLeadToPatient } from "@/lib/actions/crm";
import type { Professional } from "@/lib/agenda-types";
import type { Interaction, InteractionType, Lead } from "@/lib/crm-types";
import { leadStageMeta, leadStageOrder, type LeadStage } from "@/lib/lead-status";
import { deriveInitials } from "@/lib/patient-types";

const interactionTypeMeta: Record<InteractionType, { label: string; icon: LucideIcon }> = {
  nota: { label: "Nota", icon: StickyNote },
  ligacao: { label: "Ligação", icon: Phone },
  mensagem: { label: "Mensagem", icon: MessageCircle },
};

export function LeadDetailSheet({
  lead,
  interactions,
  professionals,
  open,
  onOpenChange,
  onStageChange,
  onEdit,
  onDelete,
  onAddInteraction,
}: {
  lead: Lead | null;
  interactions: Interaction[];
  professionals: Professional[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStageChange: (leadId: string, stage: LeadStage) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
  onAddInteraction: (interaction: Interaction) => void;
}) {
  const router = useRouter();
  const [interactionType, setInteractionType] = useState<InteractionType>("nota");
  const [content, setContent] = useState("");
  const [isConverting, setIsConverting] = useState(false);

  const professionalName = lead
    ? professionals.find((professional) => professional.id === lead.responsibleProfessionalId)?.name
    : undefined;

  const leadInteractions = lead
    ? interactions
        .filter((interaction) => interaction.leadId === lead.id)
        .sort((a, b) => (a.date < b.date ? 1 : -1))
    : [];

  async function handleAddInteraction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!lead || !content.trim()) return;

    const result = await addLeadInteraction({ leadId: lead.id, type: interactionType, content });
    if (result.data) {
      onAddInteraction(result.data);
      setContent("");
    }
  }

  async function handleConvert() {
    if (!lead) return;
    setIsConverting(true);
    const result = await convertLeadToPatient(lead.id);
    setIsConverting(false);
    if (result.data) {
      onStageChange(lead.id, "convertido");
      router.push(`/pacientes/${result.data.patientId}`);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 sm:max-w-md">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <Avatar size="lg" className="size-12">
              <AvatarFallback>{lead ? deriveInitials(lead.name) : ""}</AvatarFallback>
            </Avatar>
            <div>
              <SheetTitle>{lead?.name}</SheetTitle>
              <SheetDescription>{lead?.interest}</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4">
          <div className="flex flex-col gap-1.5">
            <Label>Etapa</Label>
            <Select
              value={lead?.stage ?? "novo"}
              onValueChange={(value) => lead && onStageChange(lead.id, value as LeadStage)}
            >
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

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Telefone</span>
              <p>{lead?.phone}</p>
            </div>
            <div>
              <span className="text-muted-foreground">E-mail</span>
              <p>{lead?.email ?? "—"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Origem</span>
              <p>{lead?.origin}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Responsável</span>
              <p>{professionalName ?? "—"}</p>
            </div>
          </div>

          {lead?.notes && <p className="text-muted-foreground text-sm">{lead.notes}</p>}

          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium">Histórico de interações</h3>
            {leadInteractions.length === 0 && (
              <p className="text-muted-foreground text-xs">Nenhuma interação registrada ainda.</p>
            )}
            <ul className="flex flex-col gap-3">
              {leadInteractions.map((interaction) => {
                const meta = interactionTypeMeta[interaction.type];
                return (
                  <li key={interaction.id} className="flex gap-2 text-sm">
                    <meta.icon className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                    <div>
                      <p>{interaction.content}</p>
                      <p className="text-muted-foreground text-xs">
                        {format(new Date(`${interaction.date}T00:00:00`), "dd/MM/yyyy", {
                          locale: ptBR,
                        })}{" "}
                        · {interaction.author}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <form className="flex flex-col gap-2 border-t pt-4" onSubmit={handleAddInteraction}>
            <Label htmlFor="interaction-content">Registrar interação</Label>
            <div className="flex gap-2">
              <Select
                value={interactionType}
                onValueChange={(value) => setInteractionType(value as InteractionType)}
              >
                <SelectTrigger className="w-28 shrink-0">
                  <SelectValue>
                    {(value: string) => interactionTypeMeta[value as InteractionType].label}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(interactionTypeMeta).map(([value, typeMeta]) => (
                    <SelectItem key={value} value={value}>
                      {typeMeta.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Textarea
                id="interaction-content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="O que aconteceu?"
                rows={1}
                className="min-h-8 flex-1"
              />
            </div>
            <Button type="submit" size="sm" className="self-end">
              Adicionar
            </Button>
          </form>
        </div>

        <SheetFooter className="flex-row justify-between border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => lead && onDelete(lead)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 />
            Excluir
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => lead && onEdit(lead)}>
              <Pencil />
              Editar
            </Button>
            <Button
              size="sm"
              onClick={handleConvert}
              disabled={lead?.stage === "convertido" || isConverting}
            >
              <UserCheck />
              {isConverting ? "Convertendo..." : "Converter em paciente"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
