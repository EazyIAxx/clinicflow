import { CheckCircle2, Clock, type LucideIcon } from "lucide-react";

export type UserRole = "recepcionista" | "profissional" | "gestor";
export type UserAccountStatus = "ativo" | "convite_pendente";

export type SystemUser = {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: UserRole;
  status: UserAccountStatus;
};

export const userRoleLabels: Record<UserRole, string> = {
  recepcionista: "Recepcionista",
  profissional: "Profissional de saúde",
  gestor: "Gestor/Admin",
};

export const userRoles = Object.entries(userRoleLabels).map(([value, label]) => ({
  value: value as UserRole,
  label,
}));

type AccountStatusMeta = {
  label: string;
  icon: LucideIcon;
  badgeClassName: string;
};

export const userAccountStatusMeta: Record<UserAccountStatus, AccountStatusMeta> = {
  ativo: {
    label: "Ativo",
    icon: CheckCircle2,
    badgeClassName: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400",
  },
  convite_pendente: {
    label: "Convite pendente",
    icon: Clock,
    badgeClassName: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400",
  },
};

export function getMockUsers(): SystemUser[] {
  return [
    {
      id: "user-1",
      name: "Ana Souza",
      email: "ana.souza@clinicflow.com",
      initials: "AS",
      role: "gestor",
      status: "ativo",
    },
    {
      id: "user-2",
      name: "Camila Rocha",
      email: "camila.rocha@clinicflow.com",
      initials: "CR",
      role: "profissional",
      status: "ativo",
    },
    {
      id: "user-3",
      name: "Rafael Nunes",
      email: "rafael.nunes@clinicflow.com",
      initials: "RN",
      role: "profissional",
      status: "ativo",
    },
    {
      id: "user-4",
      name: "Beatriz Lima",
      email: "beatriz.lima@clinicflow.com",
      initials: "BL",
      role: "profissional",
      status: "ativo",
    },
    {
      id: "user-5",
      name: "Juliana Andrade",
      email: "juliana.andrade@clinicflow.com",
      initials: "JA",
      role: "recepcionista",
      status: "ativo",
    },
    {
      id: "user-6",
      name: "Marcos Tavares",
      email: "marcos.tavares@clinicflow.com",
      initials: "MT",
      role: "recepcionista",
      status: "ativo",
    },
    {
      id: "user-7",
      name: "Thiago Alves",
      email: "thiago.alves@clinicflow.com",
      initials: "TA",
      role: "profissional",
      status: "convite_pendente",
    },
  ];
}
