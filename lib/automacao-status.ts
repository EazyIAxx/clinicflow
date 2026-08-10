import { PauseCircle, Power, type LucideIcon } from "lucide-react";

export type AutomationStatus = "ativa" | "pausada";

type StatusMeta = {
  label: string;
  icon: LucideIcon;
  badgeClassName: string;
};

export const automationStatusOrder: AutomationStatus[] = ["ativa", "pausada"];

export const automationStatusMeta: Record<AutomationStatus, StatusMeta> = {
  ativa: {
    label: "Ativa",
    icon: Power,
    badgeClassName: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400",
  },
  pausada: {
    label: "Pausada",
    icon: PauseCircle,
    badgeClassName: "bg-muted text-muted-foreground",
  },
};
