"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";

import { CrmColumn } from "@/components/crm/crm-column";
import type { Interaction, Lead } from "@/lib/crm-types";
import { leadStageOrder, type LeadStage } from "@/lib/lead-status";

export function CrmBoard({
  leads,
  interactions,
  referenceDate,
  onCardClick,
  onStageChange,
}: {
  leads: Lead[];
  interactions: Interaction[];
  referenceDate: Date;
  onCardClick: (lead: Lead) => void;
  onStageChange: (leadId: string, stage: LeadStage) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const newStage = over.id as LeadStage;
    const lead = leads.find((existing) => existing.id === active.id);
    if (lead && lead.stage !== newStage) {
      onStageChange(lead.id, newStage);
    }
  }

  return (
    <DndContext id="crm-board" sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {leadStageOrder.map((stage) => (
          <CrmColumn
            key={stage}
            stage={stage}
            leads={leads.filter((lead) => lead.stage === stage)}
            interactions={interactions}
            referenceDate={referenceDate}
            onCardClick={onCardClick}
          />
        ))}
      </div>
    </DndContext>
  );
}
