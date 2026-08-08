import { FolderOpen } from "lucide-react";

import { DocumentCard } from "@/components/prontuarios/document-card";
import { documentCategories, documentCategoryMeta } from "@/lib/document-access";
import type { PatientDocument } from "@/lib/mock-documentos";

export function DocumentsGrid({
  documents,
  onRemove,
  getPatientName,
  emptyMessage = "Nenhum documento ainda.",
}: {
  documents: PatientDocument[];
  onRemove: (document: PatientDocument) => void;
  getPatientName?: (patientId: string) => string | undefined;
  emptyMessage?: string;
}) {
  if (documents.length === 0) {
    return (
      <div className="text-muted-foreground flex flex-col items-center gap-2 rounded-lg border border-dashed py-12 text-center text-sm">
        <FolderOpen className="size-6" />
        {emptyMessage}
      </div>
    );
  }

  const sorted = [...documents].sort((a, b) => (a.uploadedAt < b.uploadedAt ? 1 : -1));

  return (
    <div className="flex flex-col gap-6">
      {documentCategories.map((category) => {
        const categoryDocuments = sorted.filter((document) => document.category === category);
        if (categoryDocuments.length === 0) return null;

        const meta = documentCategoryMeta[category];

        return (
          <div key={category} className="flex flex-col gap-3">
            <h3 className="text-muted-foreground flex items-center gap-1.5 text-sm font-medium">
              <meta.icon className="size-4" />
              {meta.label}s
              <span className="text-muted-foreground/70">({categoryDocuments.length})</span>
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {categoryDocuments.map((document) => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  patientName={getPatientName?.(document.patientId)}
                  onRemove={onRemove}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
