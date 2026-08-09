import {
  CalendarCheck,
  CheckCircle2,
  MessageCircle,
  UserPlus,
  XCircle,
  type LucideIcon,
} from "lucide-react";

export type LeadStage = "novo" | "em_conversa" | "agendado" | "convertido" | "perdido";

type StageMeta = {
  label: string;
  icon: LucideIcon;
  badgeClassName: string;
  columnClassName: string;
};

export const leadStageOrder: LeadStage[] = [
  "novo",
  "em_conversa",
  "agendado",
  "convertido",
  "perdido",
];

export const leadStageMeta: Record<LeadStage, StageMeta> = {
  novo: {
    label: "Novo contato",
    icon: UserPlus,
    badgeClassName: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-400",
    columnClassName: "border-t-blue-400 dark:border-t-blue-500",
  },
  em_conversa: {
    label: "Em conversa",
    icon: MessageCircle,
    badgeClassName: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400",
    columnClassName: "border-t-amber-400 dark:border-t-amber-500",
  },
  agendado: {
    label: "Agendado",
    icon: CalendarCheck,
    badgeClassName: "bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-400",
    columnClassName: "border-t-violet-400 dark:border-t-violet-500",
  },
  convertido: {
    label: "Convertido",
    icon: CheckCircle2,
    badgeClassName: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400",
    columnClassName: "border-t-emerald-400 dark:border-t-emerald-500",
  },
  perdido: {
    label: "Perdido",
    icon: XCircle,
    badgeClassName: "bg-muted text-muted-foreground",
    columnClassName: "border-t-border",
  },
};
