import { CalendarClock, CheckCircle2, Clock, Lock, XCircle, type LucideIcon } from "lucide-react";

export type AppointmentStatus = "pendente" | "confirmada" | "remarcada" | "cancelada" | "bloqueio";

type StatusMeta = {
  label: string;
  icon: LucideIcon;
  badgeClassName: string;
  cardClassName: string;
};

export const statusMeta: Record<AppointmentStatus, StatusMeta> = {
  pendente: {
    label: "Aguardando confirmação",
    icon: Clock,
    badgeClassName: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400",
    cardClassName:
      "border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/15",
  },
  confirmada: {
    label: "Confirmada",
    icon: CheckCircle2,
    badgeClassName: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400",
    cardClassName:
      "border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/15",
  },
  remarcada: {
    label: "Remarcada",
    icon: CalendarClock,
    badgeClassName: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-400",
    cardClassName:
      "border-blue-300 bg-blue-50 text-blue-900 hover:bg-blue-100 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/15",
  },
  cancelada: {
    label: "Cancelada",
    icon: XCircle,
    badgeClassName: "bg-muted text-muted-foreground",
    cardClassName:
      "border-border bg-muted/60 text-muted-foreground line-through decoration-muted-foreground/50 hover:bg-muted",
  },
  bloqueio: {
    label: "Bloqueio de horário",
    icon: Lock,
    badgeClassName: "bg-muted text-muted-foreground",
    cardClassName:
      "border-dashed border-border bg-muted/40 text-muted-foreground hover:bg-muted/60",
  },
};
