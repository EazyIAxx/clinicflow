import { FileCheck2, FileHeart, FileText, Stethoscope, type LucideIcon } from "lucide-react";

export type DocumentCategory = "exame" | "receita" | "atestado" | "documento";
export type AccessRole = "recepcao" | "profissional" | "gestor";

type CategoryMeta = {
  label: string;
  icon: LucideIcon;
  badgeClassName: string;
  /** Perfis com visibilidade sobre documentos dessa categoria. */
  accessRoles: AccessRole[];
};

export const accessRoleLabels: Record<AccessRole, string> = {
  recepcao: "Recepção",
  profissional: "Profissional responsável",
  gestor: "Gestor/Admin",
};

export const documentCategories: DocumentCategory[] = ["exame", "receita", "atestado", "documento"];

export const documentCategoryMeta: Record<DocumentCategory, CategoryMeta> = {
  exame: {
    label: "Exame",
    icon: FileHeart,
    badgeClassName: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-400",
    accessRoles: ["profissional", "gestor"],
  },
  receita: {
    label: "Receita",
    icon: Stethoscope,
    badgeClassName: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400",
    accessRoles: ["recepcao", "profissional", "gestor"],
  },
  atestado: {
    label: "Atestado",
    icon: FileCheck2,
    badgeClassName: "bg-cyan-100 text-cyan-800 dark:bg-cyan-500/15 dark:text-cyan-400",
    accessRoles: ["recepcao", "profissional", "gestor"],
  },
  documento: {
    label: "Documento",
    icon: FileText,
    badgeClassName: "bg-muted text-muted-foreground",
    accessRoles: ["recepcao", "profissional", "gestor"],
  },
};
