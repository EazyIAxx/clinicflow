import { CalendarX, CheckCircle2, FileEdit, Send, XCircle, type LucideIcon } from "lucide-react";

export type BudgetStatus = "rascunho" | "enviado" | "aprovado" | "recusado" | "expirado";

type StatusMeta = {
  label: string;
  icon: LucideIcon;
  badgeClassName: string;
};

export const budgetStatusOrder: BudgetStatus[] = [
  "rascunho",
  "enviado",
  "aprovado",
  "recusado",
  "expirado",
];

export const budgetStatusMeta: Record<BudgetStatus, StatusMeta> = {
  rascunho: {
    label: "Rascunho",
    icon: FileEdit,
    badgeClassName: "bg-muted text-muted-foreground",
  },
  enviado: {
    label: "Enviado",
    icon: Send,
    badgeClassName: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-400",
  },
  aprovado: {
    label: "Aprovado",
    icon: CheckCircle2,
    badgeClassName: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400",
  },
  recusado: {
    label: "Recusado",
    icon: XCircle,
    badgeClassName: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-400",
  },
  expirado: {
    label: "Expirado",
    icon: CalendarX,
    badgeClassName: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400",
  },
};
