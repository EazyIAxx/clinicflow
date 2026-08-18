"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { CashflowChart } from "@/components/financeiro/cashflow-chart";
import { ChargeFormDialog } from "@/components/financeiro/charge-form-dialog";
import { ChargesStatusChart } from "@/components/financeiro/charges-status-chart";
import { ChargesTable } from "@/components/financeiro/charges-table";
import { ChargesToolbar } from "@/components/financeiro/charges-toolbar";
import { ExpenseFormDialog } from "@/components/financeiro/expense-form-dialog";
import { ExpensesByCategoryChart } from "@/components/financeiro/expenses-by-category-chart";
import { ExpensesTable } from "@/components/financeiro/expenses-table";
import { ExpensesToolbar } from "@/components/financeiro/expenses-toolbar";
import { ImportExpensesDialog } from "@/components/financeiro/import-expenses-dialog";
import { PatientPaymentsChart } from "@/components/financeiro/patient-payments-chart";
import { PaymentDialog } from "@/components/financeiro/payment-dialog";
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
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  cancelCharge,
  deleteCharge,
  deleteExpense,
  markExpensePaid,
} from "@/lib/actions/financeiro";
import type { ChargeDisplayStatus, ExpenseDisplayStatus } from "@/lib/finance-status";
import {
  getCashflowTrend,
  getChargeDisplayStatus,
  getChargesStatusBreakdown,
  getExpenseDisplayStatus,
  getExpensesByCategory,
  getFinanceStats,
  getPatientPaymentsTrend,
  type Charge,
  type Expense,
} from "@/lib/financeiro-types";
import type { Budget } from "@/lib/orcamentos-types";
import type { Patient } from "@/lib/patient-types";
import { formatCurrency } from "@/lib/utils";

export function FinanceiroView({
  initialCharges,
  initialExpenses,
  patients,
  approvedBudgets,
  referenceDate,
}: {
  initialCharges: Charge[];
  initialExpenses: Expense[];
  patients: Patient[];
  approvedBudgets: Budget[];
  referenceDate: Date;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [charges, setCharges] = useState<Charge[]>(initialCharges);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);

  const [chargeSearch, setChargeSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ChargeDisplayStatus | "todos">("todos");
  const [patientFilter, setPatientFilter] = useState("todos");
  const [cashflowPatientId, setCashflowPatientId] = useState("todos");

  const [isChargeFormOpen, setIsChargeFormOpen] = useState(false);
  const [chargeFormKey, setChargeFormKey] = useState(0);
  const [editingCharge, setEditingCharge] = useState<Charge | undefined>(undefined);

  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentKey, setPaymentKey] = useState(0);
  const [chargeToPay, setChargeToPay] = useState<Charge | null>(null);

  const [chargeToDelete, setChargeToDelete] = useState<Charge | null>(null);

  const [expenseSearch, setExpenseSearch] = useState("");
  const [expenseStatusFilter, setExpenseStatusFilter] = useState<ExpenseDisplayStatus | "todos">(
    "todos",
  );
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const [expenseFormKey, setExpenseFormKey] = useState(0);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);

  const patientsById = useMemo(
    () => Object.fromEntries(patients.map((patient) => [patient.id, patient])),
    [patients],
  );

  const filteredCharges = charges.filter((charge) => {
    const patientName = patientsById[charge.patientId]?.name ?? "";
    const matchesSearch = patientName.toLowerCase().includes(chargeSearch.toLowerCase());
    const matchesStatus =
      statusFilter === "todos" || getChargeDisplayStatus(charge, referenceDate) === statusFilter;
    const matchesPatient = patientFilter === "todos" || charge.patientId === patientFilter;
    return matchesSearch && matchesStatus && matchesPatient;
  });

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = expense.description.toLowerCase().includes(expenseSearch.toLowerCase());
    const matchesStatus =
      expenseStatusFilter === "todos" ||
      getExpenseDisplayStatus(expense, referenceDate) === expenseStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = getFinanceStats({ charges, expenses, referenceDate });
  const cashflowTrend = getCashflowTrend(charges, expenses, referenceDate, 14);
  const chargesBreakdown = getChargesStatusBreakdown(charges, referenceDate);
  const expensesByCategory = getExpensesByCategory(expenses);
  const patientPaymentsTrend =
    cashflowPatientId === "todos" ? null : getPatientPaymentsTrend(charges, cashflowPatientId);

  function openNewChargeDialog() {
    setEditingCharge(undefined);
    setChargeFormKey((key) => key + 1);
    setIsChargeFormOpen(true);
  }

  function openEditChargeDialog(charge: Charge) {
    setEditingCharge(charge);
    setChargeFormKey((key) => key + 1);
    setIsChargeFormOpen(true);
  }

  function handleChargeSubmit(charge: Charge) {
    setCharges((prev) => {
      const exists = prev.some((existing) => existing.id === charge.id);
      return exists
        ? prev.map((existing) => (existing.id === charge.id ? charge : existing))
        : [...prev, charge];
    });
    router.refresh();
  }

  function openPaymentDialog(charge: Charge) {
    setChargeToPay(charge);
    setPaymentKey((key) => key + 1);
    setIsPaymentOpen(true);
  }

  function handleCancelCharge(charge: Charge) {
    setCharges((prev) =>
      prev.map((existing) =>
        existing.id === charge.id ? { ...existing, status: "cancelado" } : existing,
      ),
    );
    startTransition(async () => {
      await cancelCharge(charge.id);
      router.refresh();
    });
  }

  function handleConfirmDeleteCharge() {
    if (!chargeToDelete) return;
    const id = chargeToDelete.id;
    startTransition(async () => {
      await deleteCharge(id);
      setCharges((prev) => prev.filter((existing) => existing.id !== id));
      router.refresh();
    });
    setChargeToDelete(null);
  }

  function openNewExpenseDialog() {
    setEditingExpense(undefined);
    setExpenseFormKey((key) => key + 1);
    setIsExpenseFormOpen(true);
  }

  function openEditExpenseDialog(expense: Expense) {
    setEditingExpense(expense);
    setExpenseFormKey((key) => key + 1);
    setIsExpenseFormOpen(true);
  }

  function handleExpenseSubmit(expense: Expense) {
    setExpenses((prev) => {
      const exists = prev.some((existing) => existing.id === expense.id);
      return exists
        ? prev.map((existing) => (existing.id === expense.id ? expense : existing))
        : [...prev, expense];
    });
    router.refresh();
  }

  function handleMarkExpenseAsPaid(expense: Expense) {
    const paidAt = new Date().toISOString().slice(0, 10);
    setExpenses((prev) =>
      prev.map((existing) =>
        existing.id === expense.id ? { ...existing, status: "pago", paidAt } : existing,
      ),
    );
    startTransition(async () => {
      await markExpensePaid(expense.id, paidAt);
      router.refresh();
    });
  }

  function handleExpensesImported(created: Expense[]) {
    setExpenses((prev) => [...prev, ...created]);
    router.refresh();
  }

  function handleConfirmDeleteExpense() {
    if (!expenseToDelete) return;
    const id = expenseToDelete.id;
    startTransition(async () => {
      await deleteExpense(id);
      setExpenses((prev) => prev.filter((existing) => existing.id !== id));
      router.refresh();
    });
    setExpenseToDelete(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <Tabs defaultValue="visao-geral">
        <TabsList>
          <TabsTrigger value="visao-geral">Visão geral</TabsTrigger>
          <TabsTrigger value="receber">Contas a receber</TabsTrigger>
          <TabsTrigger value="despesas">Despesas</TabsTrigger>
        </TabsList>

        <TabsContent value="visao-geral" className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h3 className="text-muted-foreground text-sm font-medium">Faturamento</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardDescription>Hoje</CardDescription>
                  <CardTitle className="text-2xl">{formatCurrency(stats.dailyRevenue)}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardDescription>Esta semana</CardDescription>
                  <CardTitle className="text-2xl">{formatCurrency(stats.weeklyRevenue)}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardDescription>Este mês</CardDescription>
                  <CardTitle className="text-2xl">{formatCurrency(stats.monthRevenue)}</CardTitle>
                </CardHeader>
              </Card>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-muted-foreground text-sm font-medium">Resumo do mês</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Card>
                <CardHeader>
                  <CardDescription>Receita</CardDescription>
                  <CardTitle className="text-2xl">{formatCurrency(stats.monthRevenue)}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardDescription>Despesas</CardDescription>
                  <CardTitle className="text-2xl">{formatCurrency(stats.monthExpenses)}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardDescription>Valor líquido</CardDescription>
                  <CardTitle
                    className={`text-2xl ${stats.netAmount < 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}
                  >
                    {formatCurrency(stats.netAmount)}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardDescription>Inadimplência</CardDescription>
                  <CardTitle className="text-2xl">{formatCurrency(stats.overdueAmount)}</CardTitle>
                </CardHeader>
              </Card>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Fluxo de caixa</CardTitle>
                <CardDescription>
                  {cashflowPatientId === "todos"
                    ? "Receita paga x despesas nos últimos 14 dias."
                    : `Pagamentos de ${patientsById[cashflowPatientId]?.name ?? "paciente"}.`}
                </CardDescription>
                <CardAction>
                  <Select
                    value={cashflowPatientId}
                    onValueChange={(value) => setCashflowPatientId(value as string)}
                  >
                    <SelectTrigger className="w-32 sm:w-44">
                      <SelectValue>
                        {(value: string) =>
                          value === "todos"
                            ? "Todos os pacientes"
                            : (patientsById[value]?.name ?? value)
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os pacientes</SelectItem>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardAction>
              </CardHeader>
              <CardContent>
                {cashflowPatientId === "todos" ? (
                  <CashflowChart trend={cashflowTrend} />
                ) : (
                  <PatientPaymentsChart payments={patientPaymentsTrend ?? []} />
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Cobranças por status</CardTitle>
                <CardDescription>Distribuição das contas a receber cadastradas.</CardDescription>
              </CardHeader>
              <CardContent>
                <ChargesStatusChart breakdown={chargesBreakdown} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Despesas por categoria</CardTitle>
                <CardDescription>Distribuição das despesas cadastradas.</CardDescription>
              </CardHeader>
              <CardContent>
                <ExpensesByCategoryChart breakdown={expensesByCategory} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="receber" className="mt-4 flex flex-col gap-4">
          <ChargesToolbar
            search={chargeSearch}
            onSearchChange={setChargeSearch}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            patientFilter={patientFilter}
            onPatientFilterChange={setPatientFilter}
            patients={patients}
            onNewCharge={openNewChargeDialog}
          />
          <ChargesTable
            charges={filteredCharges}
            patientsById={patientsById}
            referenceDate={referenceDate}
            onRegisterPayment={openPaymentDialog}
            onCancel={handleCancelCharge}
            onEdit={openEditChargeDialog}
            onDelete={setChargeToDelete}
          />
        </TabsContent>

        <TabsContent value="despesas" className="mt-4 flex flex-col gap-4">
          <ExpensesToolbar
            search={expenseSearch}
            onSearchChange={setExpenseSearch}
            statusFilter={expenseStatusFilter}
            onStatusFilterChange={setExpenseStatusFilter}
            onNewExpense={openNewExpenseDialog}
            onImportCsv={() => setIsImportOpen(true)}
          />
          <ExpensesTable
            expenses={filteredExpenses}
            referenceDate={referenceDate}
            onEdit={openEditExpenseDialog}
            onMarkAsPaid={handleMarkExpenseAsPaid}
            onDelete={setExpenseToDelete}
          />
        </TabsContent>
      </Tabs>

      <ChargeFormDialog
        key={`charge-form-${chargeFormKey}`}
        open={isChargeFormOpen}
        onOpenChange={setIsChargeFormOpen}
        charge={editingCharge}
        patients={patients}
        approvedBudgets={approvedBudgets}
        onSubmit={handleChargeSubmit}
      />

      <PaymentDialog
        key={`payment-${paymentKey}`}
        open={isPaymentOpen}
        onOpenChange={setIsPaymentOpen}
        charge={chargeToPay}
        onSubmit={handleChargeSubmit}
      />

      <ExpenseFormDialog
        key={`expense-form-${expenseFormKey}`}
        open={isExpenseFormOpen}
        onOpenChange={setIsExpenseFormOpen}
        expense={editingExpense}
        onSubmit={handleExpenseSubmit}
      />

      <ImportExpensesDialog
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        onImported={handleExpensesImported}
      />

      <AlertDialog
        open={Boolean(chargeToDelete)}
        onOpenChange={(open) => !open && setChargeToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cobrança?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a cobrança de &quot;
              {chargeToDelete ? (patientsById[chargeToDelete.patientId]?.name ?? "paciente") : ""}
              &quot;? Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleConfirmDeleteCharge}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={Boolean(expenseToDelete)}
        onOpenChange={(open) => !open && setExpenseToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover despesa?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover &quot;{expenseToDelete?.description}&quot;? Essa ação
              não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleConfirmDeleteExpense}>
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
