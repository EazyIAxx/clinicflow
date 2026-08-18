"use server";

import { getCurrentUser } from "@/lib/auth";
import { mapNotification, type Notification } from "@/lib/notification-types";
import { prisma } from "@/lib/prisma";

export type NotificationsActionState<T = undefined> = {
  error?: string;
  data?: T;
};

export async function listNotifications(): Promise<NotificationsActionState<Notification[]>> {
  const currentUser = await getCurrentUser();
  if (!currentUser) return { error: "Não autenticado." };

  const rows = await prisma.notification.findMany({
    where: { clinicId: currentUser.clinicId, userId: currentUser.id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return { data: rows.map(mapNotification) };
}

export async function markNotificationRead(id: string): Promise<NotificationsActionState> {
  const currentUser = await getCurrentUser();
  if (!currentUser) return { error: "Não autenticado." };

  await prisma.notification.update({ where: { id, userId: currentUser.id }, data: { read: true } });
  return {};
}

export async function markAllNotificationsRead(): Promise<NotificationsActionState> {
  const currentUser = await getCurrentUser();
  if (!currentUser) return { error: "Não autenticado." };

  await prisma.notification.updateMany({
    where: { clinicId: currentUser.clinicId, userId: currentUser.id, read: false },
    data: { read: true },
  });
  return {};
}
