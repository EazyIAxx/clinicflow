import {
  Eye,
  File,
  FileImage,
  FileText,
  MoreHorizontal,
  Trash2,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { accessRoleLabels, documentCategoryMeta } from "@/lib/document-access";
import type { DocumentFileType, PatientDocument } from "@/lib/mock-documentos";

const fileTypeIcon: Record<DocumentFileType, LucideIcon> = {
  pdf: FileText,
  image: FileImage,
  doc: File,
};

const formatDate = (date: string) => date.split("-").reverse().join("/");

export function DocumentCard({
  document,
  patientName,
  onRemove,
}: {
  document: PatientDocument;
  patientName?: string;
  onRemove: (document: PatientDocument) => void;
}) {
  const categoryMeta = documentCategoryMeta[document.category];
  const FileIcon = fileTypeIcon[document.fileType];

  return (
    <div className="bg-card flex flex-col gap-3 rounded-lg border p-4">
      <div className="flex items-start justify-between gap-2">
        <div
          className={`flex size-9 shrink-0 items-center justify-center rounded-md ${categoryMeta.badgeClassName}`}
        >
          <FileIcon className="size-4.5" />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
            <MoreHorizontal />
            <span className="sr-only">Ações</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem variant="destructive" onClick={() => onRemove(document)}>
              <Trash2 />
              Remover
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-col gap-1">
        <p className="line-clamp-2 text-sm font-medium">{document.name}</p>
        {patientName && <p className="text-muted-foreground text-xs">{patientName}</p>}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <Badge className={categoryMeta.badgeClassName}>
          <categoryMeta.icon />
          {categoryMeta.label}
        </Badge>
        <Tooltip>
          <TooltipTrigger render={<Badge variant="outline" className="text-muted-foreground" />}>
            <Eye />
            {categoryMeta.accessRoles.length === 3 ? "Todos os perfis" : "Acesso restrito"}
          </TooltipTrigger>
          <TooltipContent>
            Visível para:{" "}
            {categoryMeta.accessRoles.map((role) => accessRoleLabels[role]).join(", ")}
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="text-muted-foreground mt-auto flex items-center justify-between text-xs">
        <span>{formatDate(document.uploadedAt)}</span>
        <span>{document.sizeLabel}</span>
      </div>
      <div className="text-muted-foreground -mt-2 text-xs">Enviado por {document.uploadedBy}</div>
    </div>
  );
}
