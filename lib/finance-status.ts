import { AlertTriangle, CheckCircle2, Clock, XCircle, type LucideIcon } from "lucide-react";

export type ChargeStatus = "pendente" | "pago" | "cancelado";
/** Estado exibido na UI — inclui "atrasado", que é calculado, não gravado. */
export type ChargeDisplayStatus = ChargeStatus | "atrasado";

type StatusMeta = {
  label: string;
  icon: LucideIcon;
  badgeClassName: string;
};

export const chargeStatusOrder: ChargeStatus[] = ["pendente", "pago", "cancelado"];

export const chargeStatusMeta: Record<ChargeDisplayStatus, StatusMeta> = {
  pendente: {
    label: "Pendente",
    icon: Clock,
    badgeClassName: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400",
  },
  pago: {
    label: "Pago",
    icon: CheckCircle2,
    badgeClassName: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400",
  },
  cancelado: {
    label: "Cancelado",
    icon: XCircle,
    badgeClassName: "bg-muted text-muted-foreground",
  },
  atrasado: {
    label: "Atrasado",
    icon: AlertTriangle,
    badgeClassName: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-400",
  },
};
