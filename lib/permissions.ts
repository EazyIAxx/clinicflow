import { Check, Eye, Minus, type LucideIcon } from "lucide-react";

import type { UserRole } from "@/lib/mock-usuarios";

export type PermissionModule =
  | "agenda"
  | "estoque"
  | "pacientes"
  | "crm"
  | "orcamentos"
  | "financeiro"
  | "automacoes"
  | "relatorios"
  | "configuracoes";

export type AccessLevel = "nenhum" | "visualizar" | "gerenciar";

export const permissionModuleLabels: Record<PermissionModule, string> = {
  agenda: "Agenda",
  estoque: "Estoque",
  pacientes: "Pacientes / Prontuário",
  crm: "CRM",
  orcamentos: "Orçamentos",
  financeiro: "Financeiro",
  automacoes: "Automações",
  relatorios: "Relatórios",
  configuracoes: "Configurações",
};

export const permissionModules = Object.entries(permissionModuleLabels).map(([value, label]) => ({
  value: value as PermissionModule,
  label,
}));

type AccessLevelMeta = {
  label: string;
  icon: LucideIcon;
  className: string;
};

export const accessLevelMeta: Record<AccessLevel, AccessLevelMeta> = {
  nenhum: {
    label: "Sem acesso",
    icon: Minus,
    className: "text-muted-foreground",
  },
  visualizar: {
    label: "Visualizar",
    icon: Eye,
    className: "text-blue-600 dark:text-blue-400",
  },
  gerenciar: {
    label: "Gerenciar",
    icon: Check,
    className: "text-emerald-600 dark:text-emerald-400",
  },
};

/**
 * Referência de acesso por perfil — usada só de leitura na aba Permissões.
 * A aplicação real (RLS no Supabase) é do M6 (backend).
 */
export const permissionsMatrix: Record<UserRole, Record<PermissionModule, AccessLevel>> = {
  recepcionista: {
    agenda: "gerenciar",
    estoque: "visualizar",
    pacientes: "gerenciar",
    crm: "gerenciar",
    orcamentos: "gerenciar",
    financeiro: "nenhum",
    automacoes: "gerenciar",
    relatorios: "nenhum",
    configuracoes: "nenhum",
  },
  profissional: {
    agenda: "visualizar",
    estoque: "nenhum",
    pacientes: "gerenciar",
    crm: "gerenciar",
    orcamentos: "visualizar",
    financeiro: "nenhum",
    automacoes: "visualizar",
    relatorios: "nenhum",
    configuracoes: "nenhum",
  },
  gestor: {
    agenda: "gerenciar",
    estoque: "gerenciar",
    pacientes: "gerenciar",
    crm: "gerenciar",
    orcamentos: "gerenciar",
    financeiro: "gerenciar",
    automacoes: "gerenciar",
    relatorios: "gerenciar",
    configuracoes: "gerenciar",
  },
};
