"use client";

import { Check, Copy, Pencil, Send, Trash2, X } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Professional } from "@/lib/agenda-types";
import { budgetStatusMeta, type BudgetStatus } from "@/lib/orcamento-status";
import { computeBudgetTotals, type Budget, type Procedure } from "@/lib/orcamentos-types";
import type { Patient } from "@/lib/patient-types";
import { formatCurrency } from "@/lib/utils";

const formatDate = (date: string) => date.split("-").reverse().join("/");

export function BudgetDetailSheet({
  budget,
  patient,
  professionals,
  procedures,
  open,
  onOpenChange,
  onStatusChange,
  onEdit,
  onDelete,
  canManage,
}: {
  budget: Budget | null;
  patient: Patient | undefined;
  professionals: Professional[];
  procedures: Procedure[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (budgetId: string, status: BudgetStatus) => void;
  onEdit: (budget: Budget) => void;
  onDelete: (budget: Budget) => void;
  canManage: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const totals = budget
    ? computeBudgetTotals(budget)
    : { subtotal: 0, discountAmount: 0, total: 0 };
  const statusInfo = budget ? budgetStatusMeta[budget.status] : undefined;
  const professionalName = budget
    ? professionals.find((professional) => professional.id === budget.responsibleProfessionalId)
        ?.name
    : undefined;

  async function handleShare() {
    if (!budget) return;
    await navigator.clipboard.writeText(`https://clinicflow.app/orcamentos/${budget.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 sm:max-w-md">
        <SheetHeader>
          <div className="flex items-center justify-between gap-2">
            <div>
              <SheetTitle>{patient?.name ?? "Orçamento"}</SheetTitle>
              <SheetDescription>
                {budget ? `Criado em ${formatDate(budget.createdAt)}` : ""}
              </SheetDescription>
            </div>
            {statusInfo && (
              <Badge className={statusInfo.badgeClassName}>
                <statusInfo.icon />
                {statusInfo.label}
              </Badge>
            )}
          </div>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Profissional responsável</span>
              <p>{professionalName ?? "—"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Validade</span>
              <p>{budget ? formatDate(budget.validUntil) : "—"}</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium">Itens</h3>
            <div className="flex flex-col gap-2">
              {budget?.items.map((item) => {
                const procedure = procedures.find((candidate) => candidate.id === item.procedureId);
                return (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <p>{procedure?.name ?? "Procedimento removido"}</p>
                    <span className="font-medium">{formatCurrency(item.amount)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-muted/40 flex flex-col gap-1 rounded-md border p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Desconto {budget ? `(${budget.discountPercent}%)` : ""}
              </span>
              <span>-{formatCurrency(totals.discountAmount)}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>{formatCurrency(totals.total)}</span>
            </div>
          </div>

          {budget?.notes && <p className="text-muted-foreground text-sm">{budget.notes}</p>}

          <Button variant="outline" size="sm" onClick={handleShare} className="self-start">
            <Copy />
            {copied ? "Link copiado!" : "Copiar link de compartilhamento"}
          </Button>

          {canManage && budget?.status === "rascunho" && (
            <Button size="sm" onClick={() => onStatusChange(budget.id, "enviado")}>
              <Send />
              Marcar como enviado
            </Button>
          )}
          {canManage && budget?.status === "enviado" && (
            <div className="flex gap-2">
              <Button size="sm" onClick={() => onStatusChange(budget.id, "aprovado")}>
                <Check />
                Aprovar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onStatusChange(budget.id, "recusado")}
              >
                <X />
                Recusar
              </Button>
            </div>
          )}
        </div>

        {canManage && (
          <SheetFooter className="flex-row justify-between border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => budget && onDelete(budget)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 />
              Excluir
            </Button>
            <Button variant="outline" size="sm" onClick={() => budget && onEdit(budget)}>
              <Pencil />
              Editar
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
