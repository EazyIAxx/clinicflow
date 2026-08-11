"use client";

import { useMemo, useState } from "react";

import { CashflowChart } from "@/components/financeiro/cashflow-chart";
import { ChargeFormDialog } from "@/components/financeiro/charge-form-dialog";
import { ChargesStatusChart } from "@/components/financeiro/charges-status-chart";
import { ChargesTable } from "@/components/financeiro/charges-table";
import { ChargesToolbar } from "@/components/financeiro/charges-toolbar";
import { ExpenseFormDialog } from "@/components/financeiro/expense-form-dialog";
import { ExpensesTable } from "@/components/financeiro/expenses-table";
import { ExpensesToolbar } from "@/components/financeiro/expenses-toolbar";
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
import type { ChargeDisplayStatus } from "@/lib/finance-status";
import {
  getCashflowTrend,
  getChargeDisplayStatus,
  getChargesStatusBreakdown,
  getFinanceStats,
  getPatientPaymentsTrend,
  type Charge,
  type Expense,
} from "@/lib/mock-financeiro";
import type { Patient } from "@/lib/mock-pacientes";
import { formatCurrency } from "@/lib/utils";

export function FinanceiroView({
  initialCharges,
  initialExpenses,
  patients,
  referenceDate,
}: {
  initialCharges: Charge[];
  initialExpenses: Expense[];
  patients: Patient[];
  referenceDate: Date;
}) {
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
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const [expenseFormKey, setExpenseFormKey] = useState(0);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

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

  const filteredExpenses = expenses.filter((expense) =>
    expense.description.toLowerCase().includes(expenseSearch.toLowerCase()),
  );

  const stats = getFinanceStats({ charges, expenses, referenceDate });
  const cashflowTrend = getCashflowTrend(charges, expenses, referenceDate, 14);
  const chargesBreakdown = getChargesStatusBreakdown(charges, referenceDate);
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
  }

  function handleConfirmDeleteCharge() {
    if (!chargeToDelete) return;
    setCharges((prev) => prev.filter((existing) => existing.id !== chargeToDelete.id));
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
  }

  function handleConfirmDeleteExpense() {
    if (!expenseToDelete) return;
    setExpenses((prev) => prev.filter((existing) => existing.id !== expenseToDelete.id));
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
            onNewExpense={openNewExpenseDialog}
          />
          <ExpensesTable
            expenses={filteredExpenses}
            onEdit={openEditExpenseDialog}
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
