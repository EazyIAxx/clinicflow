"use client";

import { format } from "date-fns";
import { Plus, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";

import { DatePicker } from "@/components/shared/date-picker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { professionals } from "@/lib/mock-agenda";
import { computeBudgetTotals, type Budget, type BudgetItem } from "@/lib/mock-orcamentos";
import type { Patient } from "@/lib/mock-pacientes";
import { getMockProcedures } from "@/lib/mock-procedimentos";
import { budgetStatusMeta, budgetStatusOrder, type BudgetStatus } from "@/lib/orcamento-status";
import { formatCurrency } from "@/lib/utils";

const NONE_PROFESSIONAL = "nenhum";
const procedures = getMockProcedures();

export function BudgetFormDialog({
  open,
  onOpenChange,
  budget,
  patients,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budget?: Budget;
  patients: Patient[];
  onSubmit: (budget: Budget) => void;
}) {
  const isEditing = Boolean(budget);

  const [patientId, setPatientId] = useState(budget?.patientId ?? patients[0]?.id ?? "");
  const [responsibleProfessionalId, setResponsibleProfessionalId] = useState(
    budget?.responsibleProfessionalId ?? NONE_PROFESSIONAL,
  );
  const [items, setItems] = useState<BudgetItem[]>(
    budget?.items ?? [
      {
        id: crypto.randomUUID(),
        procedureId: procedures[0].id,
        amount: procedures[0].price,
      },
    ],
  );
  const [discountPercent, setDiscountPercent] = useState(budget?.discountPercent ?? 0);
  const [validUntil, setValidUntil] = useState<Date | undefined>(
    budget?.validUntil ? new Date(`${budget.validUntil}T00:00:00`) : undefined,
  );
  const [status, setStatus] = useState<BudgetStatus>(budget?.status ?? "rascunho");
  const [notes, setNotes] = useState(budget?.notes ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { subtotal, discountAmount, total } = computeBudgetTotals({ items, discountPercent });

  function addItem() {
    setItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        procedureId: procedures[0].id,
        amount: procedures[0].price,
      },
    ]);
  }

  function removeItem(itemId: string) {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  }

  function updateItem(itemId: string, patch: Partial<BudgetItem>) {
    setItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, ...patch } : item)));
  }

  function handleProcedureChange(itemId: string, procedureId: string) {
    const procedure = procedures.find((candidate) => candidate.id === procedureId);
    updateItem(itemId, { procedureId, amount: procedure?.price ?? 0 });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    onSubmit({
      id: budget?.id ?? crypto.randomUUID(),
      patientId,
      responsibleProfessionalId:
        responsibleProfessionalId === NONE_PROFESSIONAL ? undefined : responsibleProfessionalId,
      items,
      discountPercent,
      validUntil: validUntil ? format(validUntil, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
      status,
      notes: notes || undefined,
      createdAt: budget?.createdAt ?? format(new Date(), "yyyy-MM-dd"),
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar orçamento" : "Novo orçamento"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize os itens e condições do orçamento."
              : "Monte um orçamento de procedimentos para o paciente."}
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1"
          onSubmit={handleSubmit}
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Paciente</Label>
              <Select value={patientId} onValueChange={(value) => setPatientId(value as string)}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(value: string) =>
                      patients.find((patient) => patient.id === value)?.name ?? "Selecionar"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Profissional responsável</Label>
              <Select
                value={responsibleProfessionalId}
                onValueChange={(value) => setResponsibleProfessionalId(value as string)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(value: string) =>
                      value === NONE_PROFESSIONAL
                        ? "Nenhum"
                        : (professionals.find((professional) => professional.id === value)?.name ??
                          value)
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_PROFESSIONAL}>Nenhum</SelectItem>
                  {professionals.map((professional) => (
                    <SelectItem key={professional.id} value={professional.id}>
                      {professional.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label>Itens</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus />
                Adicionar item
              </Button>
            </div>

            <div className="flex flex-col gap-2">
              {items.map((item) => (
                <div key={item.id} className="flex items-end gap-2 rounded-md border p-2">
                  <div className="flex flex-1 flex-col gap-1">
                    <Label className="text-muted-foreground text-xs">Procedimento</Label>
                    <Select
                      value={item.procedureId}
                      onValueChange={(value) => handleProcedureChange(item.id, value as string)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue>
                          {(value: string) =>
                            procedures.find((procedure) => procedure.id === value)?.name ?? value
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {procedures.map((procedure) => (
                          <SelectItem key={procedure.id} value={procedure.id}>
                            {procedure.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex w-32 flex-col gap-1">
                    <Label className="text-muted-foreground text-xs">Valor</Label>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={item.amount}
                      onChange={(event) =>
                        updateItem(item.id, { amount: Number(event.target.value) })
                      }
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeItem(item.id)}
                    disabled={items.length === 1}
                  >
                    <Trash2 />
                    <span className="sr-only">Remover item</span>
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="budget-discount">Desconto (%)</Label>
              <Input
                id="budget-discount"
                type="number"
                min={0}
                max={100}
                value={discountPercent}
                onChange={(event) => setDiscountPercent(Number(event.target.value))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Validade</Label>
              <DatePicker date={validUntil} onDateChange={setValidUntil} className="w-full" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as BudgetStatus)}>
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(value: string) => budgetStatusMeta[value as BudgetStatus].label}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {budgetStatusOrder.map((option) => (
                  <SelectItem key={option} value={option}>
                    {budgetStatusMeta[option].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="budget-notes">Observações</Label>
            <Textarea
              id="budget-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Condições de pagamento, observações..."
              rows={2}
            />
          </div>

          <div className="bg-muted/40 flex flex-col gap-1 rounded-md border p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Desconto</span>
              <span>-{formatCurrency(discountAmount)}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting || !patientId}>
              {isEditing ? "Salvar alterações" : "Criar orçamento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
