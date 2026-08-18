import { CalendarClock, PackageX, type LucideIcon } from "lucide-react";

import type { Notification as NotificationRow } from "@/lib/generated/prisma/client";

export type NotificationType = "lembrete_consulta" | "estoque_baixo";

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string; // ISO — precisa de hora, não só o dia, pra "há N min"
};

export const notificationTypeMeta: Record<NotificationType, { icon: LucideIcon }> = {
  lembrete_consulta: { icon: CalendarClock },
  estoque_baixo: { icon: PackageX },
};

export function mapNotification(row: NotificationRow): Notification {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    message: row.message,
    link: row.link ?? undefined,
    read: row.read,
    createdAt: row.createdAt.toISOString(),
  };
}
