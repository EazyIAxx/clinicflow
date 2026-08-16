import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getCurrentUser } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await getCurrentUser();

  return (
    <SidebarProvider>
      <AppSidebar user={currentUser} />
      <SidebarInset>
        <DashboardTopbar />
        <main className="flex flex-1 flex-col gap-4 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
