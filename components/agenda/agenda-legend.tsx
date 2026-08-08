import { statusMeta, type AppointmentStatus } from "@/lib/agenda-status";

const legendOrder: AppointmentStatus[] = [
  "pendente",
  "confirmada",
  "remarcada",
  "cancelada",
  "bloqueio",
];

export function AgendaLegend() {
  return (
    <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
      {legendOrder.map((status) => {
        const meta = statusMeta[status];
        const Icon = meta.icon;
        return (
          <span key={status} className="flex items-center gap-1.5">
            <Icon className="size-3.5" />
            {meta.label}
          </span>
        );
      })}
    </div>
  );
}
