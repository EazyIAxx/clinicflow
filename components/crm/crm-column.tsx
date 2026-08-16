"use client";

import { useDroppable } from "@dnd-kit/core";

import { LeadCard } from "@/components/crm/lead-card";
import type { Interaction, Lead } from "@/lib/crm-types";
import { leadStageMeta, type LeadStage } from "@/lib/lead-status";

export function CrmColumn({
  stage,
  leads,
  interactions,
  referenceDate,
  onCardClick,
}: {
  stage: LeadStage;
  leads: Lead[];
  interactions: Interaction[];
  referenceDate: Date;
  onCardClick: (lead: Lead) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  const meta = leadStageMeta[stage];

  return (
    <div className="flex w-72 shrink-0 flex-col gap-3">
      <div className={`flex items-center justify-between border-t-2 pt-2 ${meta.columnClassName}`}>
        <span className="flex items-center gap-1.5 text-sm font-medium">
          <meta.icon className="size-4" />
          {meta.label}
        </span>
        <span className="text-muted-foreground text-xs">{leads.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className={`flex min-h-24 flex-col gap-2 rounded-lg p-1 transition-colors ${
          isOver ? "bg-muted/60" : ""
        }`}
      >
        {leads.length === 0 && (
          <p className="text-muted-foreground px-2 py-6 text-center text-xs">Nenhum lead aqui.</p>
        )}
        {leads.map((lead) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            interactions={interactions}
            referenceDate={referenceDate}
            onClick={() => onCardClick(lead)}
          />
        ))}
      </div>
    </div>
  );
}
