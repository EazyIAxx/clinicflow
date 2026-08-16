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
