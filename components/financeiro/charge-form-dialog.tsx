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
import { chargeStatusMeta, chargeStatusOrder, type ChargeStatus } from "@/lib/finance-status";
import type { Charge, ChargeSourceType } from "@/lib/mock-financeiro";
import { computeBudgetTotals, getMockBudgets } from "@/lib/mock-orcamentos";
import type { Patient } from "@/lib/mock-pacientes";
import { formatCurrency } from "@/lib/utils";

const sourceTypeLabels: Record<ChargeSourceType, string> = {
  orcamento: "Orçamento aprovado",
  consulta: "Consulta avulsa",
};

const approvedBudgets = getMockBudgets(new Date()).filter((budget) => budget.status === "aprovado");

export function ChargeFormDialog({
  open,
  onOpenChange,
  charge,
  patients,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  charge?: Charge;
  patients: Patient[];
  onSubmit: (charge: Charge) => void;
}) {
  const isEditing = Boolean(charge);

  const [sourceType, setSourceType] = useState<ChargeSourceType>(charge?.sourceType ?? "consulta");
  const [budgetId, setBudgetId] = useState(charge?.budgetId ?? approvedBudgets[0]?.id ?? "");
  const [patientId, setPatientId] = useState(charge?.patientId ?? patients[0]?.id ?? "");
  const [description, setDescription] = useState(charge?.description ?? "");
  const [amount, setAmount] = useState(charge?.amount ?? 0);
  const [dueDate, setDueDate] = useState<Date | undefined>(
    charge?.dueDate ? new Date(`${charge.dueDate}T00:00:00`) : undefined,
  );
  const [status, setStatus] = useState<ChargeStatus>(charge?.status ?? "pendente");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleBudgetChange(id: string) {
    setBudgetId(id);
    const budget = approvedBudgets.find((candidate) => candidate.id === id);
    if (!budget) return;
    setPatientId(budget.patientId);
    setAmount(computeBudgetTotals(budget).total);
    const patient = patients.find((candidate) => candidate.id === budget.patientId);
    setDescription(`Orçamento aprovado${patient ? ` - ${patient.name}` : ""}`);
  }

  function handleSourceTypeChange(value: ChargeSourceType) {
    setSourceType(value);
    if (value === "orcamento" && approvedBudgets[0]) {
      handleBudgetChange(approvedBudgets[0].id);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    onSubmit({
      id: charge?.id ?? crypto.randomUUID(),
      patientId,
      sourceType,
      budgetId: sourceType === "orcamento" ? budgetId : undefined,
      description,
      amount,
      dueDate: dueDate ? format(dueDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
      status,
      paymentMethod: charge?.paymentMethod,
      paidAt: charge?.paidAt,
      createdAt: charge?.createdAt ?? format(new Date(), "yyyy-MM-dd"),
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar cobrança" : "Nova cobrança"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize os dados da cobrança."
              : "Lance uma cobrança vinculada a um orçamento aprovado ou a uma consulta avulsa."}
          </DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <Label>Origem</Label>
            <Select
              value={sourceType}
              onValueChange={(value) => handleSourceTypeChange(value as ChargeSourceType)}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(value: string) => sourceTypeLabels[value as ChargeSourceType]}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(sourceTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {sourceType === "orcamento" ? (
            <div className="flex flex-col gap-1.5">
              <Label>Orçamento aprovado</Label>
              <Select
                value={budgetId}
                onValueChange={(value) => handleBudgetChange(value as string)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(value: string) => {
                      const budget = approvedBudgets.find((candidate) => candidate.id === value);
                      const patient = patients.find(
                        (candidate) => candidate.id === budget?.patientId,
                      );
                      return budget
                        ? `${patient?.name ?? "Paciente"} - ${formatCurrency(computeBudgetTotals(budget).total)}`
                        : "Selecionar";
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {approvedBudgets.map((budget) => {
                    const patient = patients.find((candidate) => candidate.id === budget.patientId);
                    return (
                      <SelectItem key={budget.id} value={budget.id}>
                        {patient?.name ?? "Paciente"} -{" "}
                        {formatCurrency(computeBudgetTotals(budget).total)}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          ) : (
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
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="charge-description">Descrição</Label>
            <Input
              id="charge-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Ex.: Consulta clínica geral"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="charge-amount">Valor (R$)</Label>
              <Input
                id="charge-amount"
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

          <div className="flex flex-col gap-1.5">
            <Label>Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as ChargeStatus)}>
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(value: string) => chargeStatusMeta[value as ChargeStatus].label}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {chargeStatusOrder.map((option) => (
                  <SelectItem key={option} value={option}>
                    {chargeStatusMeta[option].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isEditing ? "Salvar alterações" : "Criar cobrança"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
