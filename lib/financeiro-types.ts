import {
  differenceInCalendarDays,
  eachDayOfInterval,
  format,
  isSameDay,
  isSameMonth,
  isSameWeek,
  subDays,
} from "date-fns";
import { ptBR } from "date-fns/locale";

import type {
  Charge as ChargeRow,
  Expense as ExpenseRow,
  ExpenseCategory as PrismaExpenseCategory,
  PaymentMethod as PrismaPaymentMethod,
} from "@/lib/generated/prisma/client";
import type {
  ChargeDisplayStatus,
  ChargeStatus,
  ExpenseDisplayStatus,
  ExpenseStatus,
} from "@/lib/finance-status";

export type ChargeSourceType = "orcamento" | "consulta";
export type PaymentMethod = PrismaPaymentMethod;

export type Charge = {
  id: string;
  patientId: string;
  sourceType: ChargeSourceType;
  budgetId?: string;
  description: string;
  amount: number;
  dueDate: string; // yyyy-MM-dd
  status: ChargeStatus;
  paymentMethod?: PaymentMethod;
  paidAt?: string; // yyyy-MM-dd
  createdAt: string; // yyyy-MM-dd
};

export type ExpenseCategory =
  "Aluguel" | "Salários" | "Fornecedores" | "Marketing" | "Utilidades" | "Outros";
export type ExpenseRecurrence = "mensal" | "anual";

export type Expense = {
  id: string;
  description: string;
  category: ExpenseCategory;
  amount: number;
  dueDate: string; // yyyy-MM-dd
  status: ExpenseStatus;
  paidAt?: string; // yyyy-MM-dd
  isRecurring?: boolean;
  recurrence?: ExpenseRecurrence;
  createdAt: string; // yyyy-MM-dd
};

export const expenseCategories: ExpenseCategory[] = [
  "Aluguel",
  "Salários",
  "Fornecedores",
  "Marketing",
  "Utilidades",
  "Outros",
];

const categoryToSlug: Record<ExpenseCategory, PrismaExpenseCategory> = {
  Aluguel: "aluguel",
  Salários: "salarios",
  Fornecedores: "fornecedores",
  Marketing: "marketing",
  Utilidades: "utilidades",
  Outros: "outros",
};

const slugToCategory: Record<PrismaExpenseCategory, ExpenseCategory> = {
  aluguel: "Aluguel",
  salarios: "Salários",
  fornecedores: "Fornecedores",
  marketing: "Marketing",
  utilidades: "Utilidades",
  outros: "Outros",
};

export function categoryToPrisma(category: ExpenseCategory): PrismaExpenseCategory {
  return categoryToSlug[category];
}

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  dinheiro: "Dinheiro",
  cartao_credito: "Cartão de crédito",
  cartao_debito: "Cartão de débito",
  pix: "Pix",
  boleto: "Boleto",
};

export const paymentMethods = Object.entries(paymentMethodLabels).map(([value, label]) => ({
  value: value as PaymentMethod,
  label,
}));

/** "Atrasado" é calculado (pendente + vencimento no passado), nunca gravado. */
export function getChargeDisplayStatus(
  charge: Pick<Charge, "status" | "dueDate">,
  referenceDate: Date,
): ChargeDisplayStatus {
  if (charge.status === "pendente") {
    const dueDate = new Date(`${charge.dueDate}T00:00:00`);
    if (differenceInCalendarDays(referenceDate, dueDate) > 0) {
      return "atrasado";
    }
  }
  return charge.status;
}

/** "Atrasada" é calculada (pendente + vencimento no passado), nunca gravada. */
export function getExpenseDisplayStatus(
  expense: Pick<Expense, "status" | "dueDate">,
  referenceDate: Date,
): ExpenseDisplayStatus {
  if (expense.status === "pendente") {
    const dueDate = new Date(`${expense.dueDate}T00:00:00`);
    if (differenceInCalendarDays(referenceDate, dueDate) > 0) {
      return "atrasado";
    }
  }
  return expense.status;
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

const dateKey = (date: Date) => format(date, "yyyy-MM-dd");

export function getCashflowTrend(
  charges: Charge[],
  expenses: Expense[],
  referenceDate: Date,
  days: number,
) {
  const interval = eachDayOfInterval({
    start: subDays(referenceDate, days - 1),
    end: referenceDate,
  });

  return interval.map((day) => {
    const key = dateKey(day);
    const revenue = charges
      .filter((charge) => charge.status === "pago" && charge.paidAt === key)
      .reduce((sum, charge) => sum + charge.amount, 0);
    const expense = expenses
      .filter((item) => item.status === "pago" && item.paidAt === key)
      .reduce((sum, item) => sum + item.amount, 0);

    return { date: key, label: format(day, "dd/MM", { locale: ptBR }), revenue, expense };
  });
}

/**
 * Histórico de pagamentos de um paciente específico, um por data real de
 * pagamento — não é limitado a uma janela de dias como `getCashflowTrend`,
 * já que os pagamentos de um paciente podem estar espalhados por meses.
 */
export function getPatientPaymentsTrend(charges: Charge[], patientId: string) {
  return charges
    .filter(
      (charge): charge is Charge & { paidAt: string } =>
        charge.patientId === patientId && charge.status === "pago" && Boolean(charge.paidAt),
    )
    .sort((a, b) => (a.paidAt < b.paidAt ? -1 : 1))
    .map((charge) => ({
      date: charge.paidAt,
      label: format(new Date(`${charge.paidAt}T00:00:00`), "dd/MM", { locale: ptBR }),
      amount: charge.amount,
    }));
}

const chargeDisplayStatusOrder: ChargeDisplayStatus[] = [
  "pendente",
  "atrasado",
  "pago",
  "cancelado",
];

export function getChargesStatusBreakdown(charges: Charge[], referenceDate: Date) {
  return chargeDisplayStatusOrder.map((status) => ({
    status,
    count: charges.filter((charge) => getChargeDisplayStatus(charge, referenceDate) === status)
      .length,
  }));
}

export function getExpensesByCategory(expenses: Expense[]) {
  return expenseCategories.map((category) => ({
    category,
    total: expenses
      .filter((expense) => expense.category === category)
      .reduce((sum, expense) => sum + expense.amount, 0),
  }));
}

export function getFinanceStats({
  charges,
  expenses,
  referenceDate,
}: {
  charges: Charge[];
  expenses: Expense[];
  referenceDate: Date;
}) {
  const paidCharges = charges.filter((charge) => charge.status === "pago" && charge.paidAt);

  const dailyRevenue = paidCharges
    .filter((charge) => isSameDay(new Date(`${charge.paidAt}T00:00:00`), referenceDate))
    .reduce((sum, charge) => sum + charge.amount, 0);

  const weeklyRevenue = paidCharges
    .filter((charge) =>
      isSameWeek(new Date(`${charge.paidAt}T00:00:00`), referenceDate, { weekStartsOn: 1 }),
    )
    .reduce((sum, charge) => sum + charge.amount, 0);

  const monthRevenue = paidCharges
    .filter((charge) => isSameMonth(new Date(`${charge.paidAt}T00:00:00`), referenceDate))
    .reduce((sum, charge) => sum + charge.amount, 0);

  const pendingCharges = charges.filter(
    (charge) => getChargeDisplayStatus(charge, referenceDate) === "pendente",
  );
  const overdueCharges = charges.filter(
    (charge) => getChargeDisplayStatus(charge, referenceDate) === "atrasado",
  );

  const monthExpenses = expenses
    .filter(
      (expense) =>
        expense.status === "pago" &&
        expense.paidAt &&
        isSameMonth(new Date(`${expense.paidAt}T00:00:00`), referenceDate),
    )
    .reduce((sum, expense) => sum + expense.amount, 0);

  return {
    dailyRevenue,
    weeklyRevenue,
    monthRevenue,
    pendingCount: pendingCharges.length,
    pendingAmount: pendingCharges.reduce((sum, charge) => sum + charge.amount, 0),
    overdueAmount: overdueCharges.reduce((sum, charge) => sum + charge.amount, 0),
    monthExpenses,
    netAmount: monthRevenue - monthExpenses,
  };
}

export function mapCharge(row: ChargeRow): Charge {
  return {
    id: row.id,
    patientId: row.patientId,
    sourceType: row.sourceType,
    budgetId: row.budgetId ?? undefined,
    description: row.description,
    amount: Number(row.amount),
    dueDate: row.dueDate,
    status: row.status,
    paymentMethod: row.paymentMethod ?? undefined,
    paidAt: row.paidAt ?? undefined,
    createdAt: toDateKey(row.createdAt),
  };
}

export function mapExpense(row: ExpenseRow): Expense {
  return {
    id: row.id,
    description: row.description,
    category: slugToCategory[row.category],
    amount: Number(row.amount),
    dueDate: row.dueDate,
    status: row.status,
    paidAt: row.paidAt ?? undefined,
    isRecurring: row.isRecurring,
    recurrence: row.recurrence ?? undefined,
    createdAt: toDateKey(row.createdAt),
  };
}
