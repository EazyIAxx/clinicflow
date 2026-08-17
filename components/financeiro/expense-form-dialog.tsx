"use client";

import { format } from "date-fns";
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
import { createExpense, updateExpense } from "@/lib/actions/financeiro";
import { expenseStatusMeta, expenseStatusOrder, type ExpenseStatus } from "@/lib/finance-status";
import { expenseCategories, type Expense, type ExpenseRecurrence } from "@/lib/financeiro-types";

const NOT_RECURRING = "nao_recorrente";

export function ExpenseFormDialog({
  open,
  onOpenChange,
  expense,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: Expense;
  onSubmit: (expense: Expense) => void;
}) {
  const isEditing = Boolean(expense);

  const [description, setDescription] = useState(expense?.description ?? "");
  const [category, setCategory] = useState(expense?.category ?? expenseCategories[0]);
  const [amount, setAmount] = useState(expense?.amount ?? 0);
  const [dueDate, setDueDate] = useState<Date | undefined>(
    expense?.dueDate ? new Date(`${expense.dueDate}T00:00:00`) : new Date(),
  );
  const [status, setStatus] = useState<ExpenseStatus>(expense?.status ?? "pendente");
  const [recurrence, setRecurrence] = useState<ExpenseRecurrence | typeof NOT_RECURRING>(
    expense?.recurrence ?? NOT_RECURRING,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(undefined);

    const input = {
      description,
      category,
      amount,
      dueDate: dueDate ? format(dueDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
      status,
      isRecurring: recurrence !== NOT_RECURRING,
      recurrence: recurrence === NOT_RECURRING ? undefined : recurrence,
    };

    const result = expense ? await updateExpense(expense.id, input) : await createExpense(input);

    setIsSubmitting(false);

    if (result.error || !result.data) {
      setError(result.error ?? "Não foi possível salvar. Tente novamente.");
      return;
    }

    onSubmit(result.data);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar despesa" : "Nova despesa"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Atualize os dados da despesa." : "Registre uma despesa da clínica."}
          </DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="expense-description">Descrição</Label>
            <Input
              id="expense-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Ex.: Aluguel do consultório"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Categoria</Label>
            <Select
              value={category}
              onValueChange={(value) => setCategory(value as Expense["category"])}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {expenseCategories.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="expense-amount">Valor (R$)</Label>
              <Input
                id="expense-amount"
                type="number"
                min={0}
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(Number(event.target.value))}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Vencimento</Label>
              <DatePicker date={dueDate} onDateChange={setDueDate} className="w-full" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as ExpenseStatus)}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(value: string) => expenseStatusMeta[value as ExpenseStatus].label}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {expenseStatusOrder.map((option) => (
                    <SelectItem key={option} value={option}>
                      {expenseStatusMeta[option].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Recorrência</Label>
              <Select
                value={recurrence}
                onValueChange={(value) =>
                  setRecurrence(value as ExpenseRecurrence | typeof NOT_RECURRING)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(value: string) =>
                      value === NOT_RECURRING
                        ? "Não recorrente"
                        : value === "mensal"
                          ? "Mensal"
                          : "Anual"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NOT_RECURRING}>Não recorrente</SelectItem>
                  <SelectItem value="mensal">Mensal</SelectItem>
                  <SelectItem value="anual">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : isEditing ? "Salvar alterações" : "Cadastrar despesa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
