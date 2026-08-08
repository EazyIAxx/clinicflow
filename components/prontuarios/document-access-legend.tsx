import { Eye } from "lucide-react";

import {
  accessRoleLabels,
  documentCategories,
  documentCategoryMeta,
  type AccessRole,
  type DocumentCategory,
} from "@/lib/document-access";

export function DocumentAccessLegend() {
  const groups = new Map<string, DocumentCategory[]>();
  for (const category of documentCategories) {
    const key = documentCategoryMeta[category].accessRoles.join(",");
    groups.set(key, [...(groups.get(key) ?? []), category]);
  }

  return (
    <div className="text-muted-foreground flex flex-col gap-1 text-xs">
      {Array.from(groups.entries()).map(([key, categories]) => {
        const roles = key.split(",") as AccessRole[];
        return (
          <div key={key} className="flex flex-wrap items-center gap-1.5">
            <Eye className="size-3.5 shrink-0" />
            <span className="text-foreground font-medium">
              {categories.map((category) => `${documentCategoryMeta[category].label}s`).join(", ")}
            </span>
            visível para {roles.map((role) => accessRoleLabels[role]).join(", ")}
          </div>
        );
      })}
    </div>
  );
}
