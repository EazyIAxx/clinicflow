"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { BudgetDetailSheet } from "@/components/orcamentos/budget-detail-sheet";
import { BudgetFormDialog } from "@/components/orcamentos/budget-form-dialog";
import { OrcamentosTable } from "@/components/orcamentos/orcamentos-table";
import { OrcamentosToolbar } from "@/components/orcamentos/orcamentos-toolbar";
import { ProcedureFormDialog } from "@/components/orcamentos/procedure-form-dialog";
import { ProceduresTable } from "@/components/orcamentos/procedures-table";
import { ProceduresToolbar } from "@/components/orcamentos/procedures-toolbar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { deleteBudget, deleteProcedure, updateBudgetStatus } from "@/lib/actions/orcamentos";
import type { Professional } from "@/lib/agenda-types";
import type { BudgetStatus } from "@/lib/orcamento-status";
import { computeBudgetTotals, type Budget, type Procedure } from "@/lib/orcamentos-types";
import type { Patient } from "@/lib/patient-types";
import { formatCurrency } from "@/lib/utils";

export function OrcamentosView({
  initialBudgets,
  initialProcedures,
  patients,
  professionals,
  canManage,
}: {
  initialBudgets: Budget[];
  initialProcedures: Procedure[];
  patients: Patient[];
  professionals: Professional[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [budgets, setBudgets] = useState<Budget[]>(initialBudgets);
  const [procedures, setProcedures] = useState<Procedure[]>(initialProcedures);

  const [budgetSearch, setBudgetSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<BudgetStatus | "todos">("todos");
  const [patientFilter, setPatientFilter] = useState("todos");

  const [isBudgetFormOpen, setIsBudgetFormOpen] = useState(false);
  const [budgetFormKey, setBudgetFormKey] = useState(0);
  const [editingBudget, setEditingBudget] = useState<Budget | undefined>(undefined);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);

  const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null);

  const [procedureSearch, setProcedureSearch] = useState("");
  const [isProcedureFormOpen, setIsProcedureFormOpen] = useState(false);
  const [procedureFormKey, setProcedureFormKey] = useState(0);
  const [editingProcedure, setEditingProcedure] = useState<Procedure | undefined>(undefined);
  const [procedureToDelete, setProcedureToDelete] = useState<Procedure | null>(null);

  const patientsById = useMemo(
    () => Object.fromEntries(patients.map((patient) => [patient.id, patient])),
    [patients],
  );
  const selectedBudget = budgets.find((budget) => budget.id === selectedBudgetId) ?? null;

  const filteredBudgets = budgets.filter((budget) => {
    const patientName = patientsById[budget.patientId]?.name ?? "";
    const matchesSearch = patientName.toLowerCase().includes(budgetSearch.toLowerCase());
    const matchesStatus = statusFilter === "todos" || budget.status === statusFilter;
    const matchesPatient = patientFilter === "todos" || budget.patientId === patientFilter;
    return matchesSearch && matchesStatus && matchesPatient;
  });

  const filteredProcedures = procedures.filter((procedure) =>
    procedure.name.toLowerCase().includes(procedureSearch.toLowerCase()),
  );

  const approvedValue = budgets
    .filter((budget) => budget.status === "aprovado")
    .reduce((sum, budget) => sum + computeBudgetTotals(budget).total, 0);
  const pendingCount = budgets.filter((budget) => budget.status === "enviado").length;
  const resolvedCount = budgets.filter(
    (budget) => budget.status === "aprovado" || budget.status === "recusado",
  ).length;
  const approvedCount = budgets.filter((budget) => budget.status === "aprovado").length;
  const approvalRate = resolvedCount > 0 ? Math.round((approvedCount / resolvedCount) * 100) : 0;

  function openNewBudgetDialog() {
    setEditingBudget(undefined);
    setBudgetFormKey((key) => key + 1);
    setIsBudgetFormOpen(true);
  }

  function openEditBudgetDialog(budget: Budget) {
    setEditingBudget(budget);
    setBudgetFormKey((key) => key + 1);
    setIsBudgetFormOpen(true);
    setIsDetailOpen(false);
  }

  function handleBudgetSubmit(budget: Budget) {
    setBudgets((prev) => {
      const exists = prev.some((existing) => existing.id === budget.id);
      return exists
        ? prev.map((existing) => (existing.id === budget.id ? budget : existing))
        : [...prev, budget];
    });
    router.refresh();
  }

  function handleStatusChange(budgetId: string, status: BudgetStatus) {
    startTransition(async () => {
      const result = await updateBudgetStatus(budgetId, status);
      if (result.data) {
        setBudgets((prev) => prev.map((budget) => (budget.id === budgetId ? result.data! : budget)));
        router.refresh();
      }
    });
  }

  function openBudgetDetail(budget: Budget) {
    setSelectedBudgetId(budget.id);
    setIsDetailOpen(true);
  }

  function handleDeleteBudgetRequest(budget: Budget) {
    setIsDetailOpen(false);
    setBudgetToDelete(budget);
  }

  function handleConfirmDeleteBudget() {
    if (!budgetToDelete) return;
    const id = budgetToDelete.id;
    startTransition(async () => {
      await deleteBudget(id);
      setBudgets((prev) => prev.filter((existing) => existing.id !== id));
      router.refresh();
    });
    setBudgetToDelete(null);
  }

  function openNewProcedureDialog() {
    setEditingProcedure(undefined);
    setProcedureFormKey((key) => key + 1);
    setIsProcedureFormOpen(true);
  }

  function openEditProcedureDialog(procedure: Procedure) {
    setEditingProcedure(procedure);
    setProcedureFormKey((key) => key + 1);
    setIsProcedureFormOpen(true);
  }

  function handleProcedureSubmit(procedure: Procedure) {
    setProcedures((prev) => {
      const exists = prev.some((existing) => existing.id === procedure.id);
      return exists
        ? prev.map((existing) => (existing.id === procedure.id ? procedure : existing))
        : [...prev, procedure];
    });
    router.refresh();
  }

  function handleConfirmDeleteProcedure() {
    if (!procedureToDelete) return;
    const id = procedureToDelete.id;
    startTransition(async () => {
      await deleteProcedure(id);
      setProcedures((prev) => prev.filter((existing) => existing.id !== id));
      router.refresh();
    });
    setProcedureToDelete(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Orçamentos</CardDescription>
            <CardTitle className="text-2xl">{budgets.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Valor aprovado</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(approvedValue)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Aguardando resposta</CardDescription>
            <CardTitle className="text-2xl">{pendingCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Taxa de aprovação</CardDescription>
            <CardTitle className="text-2xl">{approvalRate}%</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="orcamentos">
        <TabsList>
          <TabsTrigger value="orcamentos">Orçamentos</TabsTrigger>
          <TabsTrigger value="procedimentos">Procedimentos</TabsTrigger>
        </TabsList>

        <TabsContent value="orcamentos" className="mt-4 flex flex-col gap-4">
          <OrcamentosToolbar
            search={budgetSearch}
            onSearchChange={setBudgetSearch}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            patientFilter={patientFilter}
            onPatientFilterChange={setPatientFilter}
            patients={patients}
            onNewBudget={openNewBudgetDialog}
            canManage={canManage}
          />
          <OrcamentosTable
            budgets={filteredBudgets}
            patientsById={patientsById}
            onView={openBudgetDetail}
            onEdit={openEditBudgetDialog}
            onDelete={setBudgetToDelete}
            canManage={canManage}
          />
        </TabsContent>

        <TabsContent value="procedimentos" className="mt-4 flex flex-col gap-4">
          <ProceduresToolbar
            search={procedureSearch}
            onSearchChange={setProcedureSearch}
            onNewProcedure={openNewProcedureDialog}
            canManage={canManage}
          />
          <ProceduresTable
            procedures={filteredProcedures}
            onEdit={openEditProcedureDialog}
            onDelete={setProcedureToDelete}
            canManage={canManage}
          />
        </TabsContent>
      </Tabs>

      <BudgetFormDialog
        key={`budget-form-${budgetFormKey}`}
        open={isBudgetFormOpen}
        onOpenChange={setIsBudgetFormOpen}
        budget={editingBudget}
        patients={patients}
        professionals={professionals}
        procedures={procedures}
        onSubmit={handleBudgetSubmit}
      />

      <BudgetDetailSheet
        budget={selectedBudget}
        patient={selectedBudget ? patientsById[selectedBudget.patientId] : undefined}
        professionals={professionals}
        procedures={procedures}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onStatusChange={handleStatusChange}
        onEdit={openEditBudgetDialog}
        onDelete={handleDeleteBudgetRequest}
        canManage={canManage}
      />

      <ProcedureFormDialog
        key={`procedure-form-${procedureFormKey}`}
        open={isProcedureFormOpen}
        onOpenChange={setIsProcedureFormOpen}
        procedure={editingProcedure}
        onSubmit={handleProcedureSubmit}
      />

      <AlertDialog
        open={Boolean(budgetToDelete)}
        onOpenChange={(open) => !open && setBudgetToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir orçamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o orçamento de &quot;
              {budgetToDelete ? (patientsById[budgetToDelete.patientId]?.name ?? "paciente") : ""}
              &quot;? Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleConfirmDeleteBudget}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={Boolean(procedureToDelete)}
        onOpenChange={(open) => !open && setProcedureToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover procedimento?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover &quot;{procedureToDelete?.name}&quot; da tabela de
              preços? Orçamentos já criados não são afetados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleConfirmDeleteProcedure}>
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
