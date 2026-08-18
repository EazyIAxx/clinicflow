"use client";

import { usePathname } from "next/navigation";

import { NotificationBell } from "@/components/dashboard/notification-bell";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { dashboardHome, navItems } from "@/lib/nav-items";

export function DashboardTopbar() {
  const pathname = usePathname();
  const current = navItems.find((item) => pathname.startsWith(item.href));
  const title = current?.title ?? dashboardHome.title;

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-5" />
      <h2 className="flex-1 text-sm font-medium">{title}</h2>
      <NotificationBell />
      <ThemeToggle />
    </header>
  );
}
