import {
  CalendarDays,
  ClipboardList,
  Handshake,
  LayoutDashboard,
  LineChart,
  Package,
  Receipt,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  milestone: string;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const navGroups: NavGroup[] = [
  {
    label: "Atendimento",
    items: [
      { title: "Agenda", href: "/agenda", icon: CalendarDays, milestone: "M2" },
      { title: "CRM", href: "/crm", icon: Handshake, milestone: "M6" },
      { title: "Pacientes", href: "/pacientes", icon: Users, milestone: "M4" },
      { title: "Prontuários", href: "/prontuarios", icon: ClipboardList, milestone: "M4" },
    ],
  },
  {
    label: "Gestão",
    items: [
      { title: "Estoque", href: "/estoque", icon: Package, milestone: "M3" },
      { title: "Orçamentos", href: "/orcamentos", icon: Receipt, milestone: "M7" },
      { title: "Relatórios", href: "/relatorios", icon: LineChart, milestone: "M5" },
      { title: "Configurações", href: "/configuracoes", icon: Settings, milestone: "M5" },
    ],
  },
];

export const navItems: NavItem[] = navGroups.flatMap((group) => group.items);

export const dashboardHome: NavItem = {
  title: "Visão geral",
  href: "/agenda",
  icon: LayoutDashboard,
  milestone: "M2",
};

export const mockUser = {
  name: "Ana Souza",
  email: "ana.souza@clinicflow.com",
  role: "Gestor/Admin",
  initials: "AS",
};
