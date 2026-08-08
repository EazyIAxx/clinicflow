import { statusMeta } from "@/lib/agenda-status";
import type { Appointment } from "@/lib/mock-agenda";
import { cn } from "@/lib/utils";

export function AgendaAppointmentCard({
  appointment,
  onClick,
}: {
  appointment: Appointment;
  onClick?: () => void;
}) {
  const meta = statusMeta[appointment.status];
  const Icon = meta.icon;
  const isBlock = appointment.kind === "bloqueio";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-full w-full flex-col items-start gap-0.5 overflow-hidden rounded-md border px-2 py-1 text-left text-xs transition-colors",
        meta.cardClassName,
      )}
    >
      <span className="flex w-full items-center gap-1 font-medium">
        <Icon className="size-3 shrink-0" />
        <span className="truncate">{isBlock ? appointment.reason : appointment.patientName}</span>
      </span>
      <span className="w-full truncate text-[11px] opacity-80">
        {appointment.startTime}
        {!isBlock && appointment.service ? ` · ${appointment.service}` : ""}
      </span>
    </button>
  );
}
