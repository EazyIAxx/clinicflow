"use client";

import { useDraggable } from "@dnd-kit/core";
import { Clock } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getDaysSinceLastContact, isLeadStale, type Interaction, type Lead } from "@/lib/crm-types";
import { deriveInitials } from "@/lib/patient-types";

export function LeadCard({
  lead,
  interactions,
  referenceDate,
  onClick,
}: {
  lead: Lead;
  interactions: Interaction[];
  referenceDate: Date;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
  });

  const daysSinceLastContact = getDaysSinceLastContact(lead.id, interactions, referenceDate);
  const isStale = isLeadStale(lead, interactions, referenceDate);

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <button
      type="button"
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={`bg-card flex w-full touch-none flex-col gap-2 rounded-lg border p-3 text-left shadow-sm transition-shadow hover:shadow-md ${isDragging ? "z-10 opacity-50" : ""}`}
    >
      <div className="flex items-center gap-2">
        <Avatar size="sm">
          <AvatarFallback>{deriveInitials(lead.name)}</AvatarFallback>
        </Avatar>
        <span className="truncate text-sm font-medium">{lead.name}</span>
      </div>
      <p className="text-muted-foreground line-clamp-2 text-xs">{lead.interest}</p>
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge variant="outline" className="text-muted-foreground">
          {lead.origin}
        </Badge>
        {isStale && (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-400">
            <Clock />
            {daysSinceLastContact}d sem retorno
          </Badge>
        )}
      </div>
    </button>
  );
}
