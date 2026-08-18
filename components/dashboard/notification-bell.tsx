"use client";

import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Bell, CheckCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/actions/notifications";
import { notificationTypeMeta, type Notification } from "@/lib/notification-types";
import { cn } from "@/lib/utils";

const POLL_INTERVAL_MS = 20000;

export function NotificationBell() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function fetchNotifications() {
      const result = await listNotifications();
      if (!cancelled && result.data) setNotifications(result.data);
    }

    fetchNotifications();
    const interval = setInterval(fetchNotifications, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  async function handleOpenNotification(notification: Notification) {
    if (!notification.read) {
      setNotifications((prev) =>
        prev.map((existing) => (existing.id === notification.id ? { ...existing, read: true } : existing)),
      );
      await markNotificationRead(notification.id);
    }
    if (notification.link) router.push(notification.link);
  }

  async function handleMarkAllRead() {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })));
    await markAllNotificationsRead();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" className="relative" />}>
        <Bell />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
        <span className="sr-only">Notificações</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1.5">
          <span className="text-sm font-medium">Notificações</span>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="text-primary flex items-center gap-1 text-xs hover:underline"
            >
              <CheckCheck className="size-3.5" />
              Marcar todas como lidas
            </button>
          )}
        </div>
        {notifications.length === 0 && (
          <p className="text-muted-foreground px-2 py-6 text-center text-sm">
            Nenhuma notificação por aqui.
          </p>
        )}
        <div className="flex max-h-96 flex-col overflow-y-auto">
          {notifications.map((notification) => {
            const Icon = notificationTypeMeta[notification.type].icon;
            return (
              <DropdownMenuItem
                key={notification.id}
                onClick={() => handleOpenNotification(notification)}
                className={cn(
                  "flex flex-col items-start gap-0.5 whitespace-normal",
                  !notification.read && "bg-primary/5",
                )}
              >
                <div className="flex w-full items-center gap-2">
                  <Icon className="text-muted-foreground size-3.5 shrink-0" />
                  <span className="flex-1 truncate text-sm font-medium">{notification.title}</span>
                  {!notification.read && <span className="bg-primary size-1.5 shrink-0 rounded-full" />}
                </div>
                <p className="text-muted-foreground pl-5.5 text-xs">{notification.message}</p>
                <p className="text-muted-foreground pl-5.5 text-[11px]">
                  {formatDistanceToNow(new Date(notification.createdAt), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </p>
              </DropdownMenuItem>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
