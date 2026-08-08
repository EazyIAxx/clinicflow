import { differenceInCalendarDays } from "date-fns";
import { AlertTriangle, CalendarX, PackageX, type LucideIcon } from "lucide-react";

export type StockFlag = "baixo" | "vencendo" | "vencido";

type FlagMeta = {
  label: string;
  icon: LucideIcon;
  badgeClassName: string;
};

export const EXPIRY_WARNING_DAYS = 30;

export const stockFlagMeta: Record<StockFlag, FlagMeta> = {
  baixo: {
    label: "Abaixo do mínimo",
    icon: PackageX,
    badgeClassName: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400",
  },
  vencendo: {
    label: "Vencendo em breve",
    icon: AlertTriangle,
    badgeClassName: "bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-400",
  },
  vencido: {
    label: "Vencido",
    icon: CalendarX,
    badgeClassName: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-400",
  },
};

export function getStockFlags(params: {
  quantity: number;
  minQuantity: number;
  expiresAt?: string;
  referenceDate: Date;
}): StockFlag[] {
  const flags: StockFlag[] = [];

  if (params.quantity <= params.minQuantity) {
    flags.push("baixo");
  }

  if (params.expiresAt) {
    const expiry = new Date(`${params.expiresAt}T00:00:00`);
    const daysUntilExpiry = differenceInCalendarDays(expiry, params.referenceDate);
    if (daysUntilExpiry < 0) {
      flags.push("vencido");
    } else if (daysUntilExpiry <= EXPIRY_WARNING_DAYS) {
      flags.push("vencendo");
    }
  }

  return flags;
}
