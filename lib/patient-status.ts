import { CheckCircle2, XCircle, type LucideIcon } from "lucide-react";

export type PatientStatus = "ativo" | "inativo";

type StatusMeta = {
  label: string;
  icon: LucideIcon;
  badgeClassName: string;
};

export const patientStatusMeta: Record<PatientStatus, StatusMeta> = {
  ativo: {
    label: "Ativo",
    icon: CheckCircle2,
    badgeClassName: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400",
  },
  inativo: {
    label: "Inativo",
    icon: XCircle,
    badgeClassName: "bg-muted text-muted-foreground",
  },
};
