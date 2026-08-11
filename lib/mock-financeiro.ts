import {
  addDays,
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
  ChargeDisplayStatus,
  ChargeStatus,
  ExpenseDisplayStatus,
  ExpenseStatus,
} from "@/lib/finance-status";

export type ChargeSourceType = "orcamento" | "consulta";
export type PaymentMethod = "dinheiro" | "cartao_credito" | "cartao_debito" | "pix" | "boleto";

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

const dateKey = (date: Date) => format(date, "yyyy-MM-dd");

/**
 * Gera cobranças mockadas com vencimento/pagamento ancorados em
 * `referenceDate` — algumas pagas, algumas pendentes, algumas atrasadas, não
 * importa quando a página é aberta. Três estão vinculadas a orçamentos
 * aprovados do M7 (budget-2, budget-5, budget-8).
 */
export function getMockCharges(referenceDate: Date): Charge[] {
  const ago = (days: number) => dateKey(subDays(referenceDate, days));
  const future = (days: number) => dateKey(addDays(referenceDate, days));

  return [
    {
      id: "charge-1",
      patientId: "pac-4",
      sourceType: "orcamento",
      budgetId: "budget-2",
      description: "Orçamento aprovado - Check-up completo",
      amount: 540,
      dueDate: future(10),
      status: "pago",
      paymentMethod: "pix",
      paidAt: ago(2),
      createdAt: ago(12),
    },
    {
      id: "charge-2",
      patientId: "pac-13",
      sourceType: "orcamento",
      budgetId: "budget-5",
      description: "Orçamento aprovado - Avaliação nutricional",
      amount: 646,
      dueDate: future(5),
      status: "pendente",
      createdAt: ago(8),
    },
    {
      id: "charge-3",
      patientId: "pac-14",
      sourceType: "orcamento",
      budgetId: "budget-8",
      description: "Orçamento aprovado - Sessões de fisioterapia",
      amount: 956.8,
      dueDate: ago(5),
      status: "pendente",
      createdAt: ago(15),
    },
    {
      id: "charge-4",
      patientId: "pac-1",
      sourceType: "consulta",
      description: "Consulta clínica geral",
      amount: 150,
      dueDate: ago(10),
      status: "pago",
      paymentMethod: "cartao_debito",
      paidAt: ago(9),
      createdAt: ago(10),
    },
    {
      id: "charge-5",
      patientId: "pac-2",
      sourceType: "consulta",
      description: "Manutenção ortodôntica",
      amount: 180,
      dueDate: ago(3),
      status: "pago",
      paymentMethod: "pix",
      paidAt: ago(3),
      createdAt: ago(3),
    },
    {
      id: "charge-6",
      patientId: "pac-6",
      sourceType: "consulta",
      description: "Consulta clínica geral",
      amount: 150,
      dueDate: future(7),
      status: "pendente",
      createdAt: ago(1),
    },
    {
      id: "charge-7",
      patientId: "pac-7",
      sourceType: "consulta",
      description: "Avaliação dermatológica",
      amount: 250,
      dueDate: ago(15),
      status: "pendente",
      createdAt: ago(16),
    },
    {
      id: "charge-8",
      patientId: "pac-9",
      sourceType: "consulta",
      description: "Consulta clínica geral",
      amount: 150,
      dueDate: ago(30),
      status: "cancelado",
      createdAt: ago(31),
    },
    {
      id: "charge-9",
      patientId: "pac-10",
      sourceType: "consulta",
      description: "Check-up completo",
      amount: 450,
      dueDate: future(3),
      status: "pendente",
      createdAt: ago(2),
    },
    {
      id: "charge-10",
      patientId: "pac-11",
      sourceType: "consulta",
      description: "Manutenção ortodôntica",
      amount: 180,
      dueDate: ago(1),
      status: "pago",
      paymentMethod: "dinheiro",
      paidAt: ago(1),
      createdAt: ago(1),
    },
    {
      id: "charge-11",
      patientId: "pac-12",
      sourceType: "consulta",
      description: "Sessão de fisioterapia",
      amount: 130,
      dueDate: future(14),
      status: "pendente",
      createdAt: ago(0),
    },
    {
      id: "charge-12",
      patientId: "pac-3",
      sourceType: "consulta",
      description: "Avaliação nutricional",
      amount: 220,
      dueDate: ago(20),
      status: "pendente",
      createdAt: ago(21),
    },
  ];
}

/**
 * Gera despesas mockadas ancoradas em `referenceDate`, cobrindo as
 * principais categorias de custo fixo/variável da clínica — a maioria já
 * paga (histórico), mais algumas pendentes/atrasadas e recorrentes pra
 * demonstrar o controle de contas a pagar.
 */
export function getMockExpenses(referenceDate: Date): Expense[] {
  const ago = (days: number) => dateKey(subDays(referenceDate, days));
  const future = (days: number) => dateKey(addDays(referenceDate, days));

  return [
    {
      id: "expense-1",
      description: "Aluguel do consultório",
      category: "Aluguel",
      amount: 3500,
      dueDate: ago(5),
      status: "pago",
      paidAt: ago(5),
      isRecurring: true,
      recurrence: "mensal",
      createdAt: ago(35),
    },
    {
      id: "expense-2",
      description: "Folha de pagamento - equipe",
      category: "Salários",
      amount: 12000,
      dueDate: ago(3),
      status: "pago",
      paidAt: ago(3),
      isRecurring: true,
      recurrence: "mensal",
      createdAt: ago(33),
    },
    {
      id: "expense-3",
      description: "Compra de materiais - Farma Distribuidora",
      category: "Fornecedores",
      amount: 890,
      dueDate: ago(10),
      status: "pago",
      paidAt: ago(10),
      createdAt: ago(12),
    },
    {
      id: "expense-4",
      description: "Anúncios Instagram e Google Ads",
      category: "Marketing",
      amount: 600,
      dueDate: ago(7),
      status: "pago",
      paidAt: ago(7),
      isRecurring: true,
      recurrence: "mensal",
      createdAt: ago(37),
    },
    {
      id: "expense-5",
      description: "Conta de energia elétrica",
      category: "Utilidades",
      amount: 420,
      dueDate: ago(8),
      status: "pago",
      paidAt: ago(8),
      isRecurring: true,
      recurrence: "mensal",
      createdAt: ago(38),
    },
    {
      id: "expense-6",
      description: "Conta de água",
      category: "Utilidades",
      amount: 180,
      dueDate: ago(8),
      status: "pago",
      paidAt: ago(8),
      isRecurring: true,
      recurrence: "mensal",
      createdAt: ago(38),
    },
    {
      id: "expense-7",
      description: "Manutenção de equipamentos",
      category: "Outros",
      amount: 350,
      dueDate: ago(15),
      status: "pago",
      paidAt: ago(15),
      createdAt: ago(17),
    },
    {
      id: "expense-8",
      description: "Compra de materiais - MedSupply",
      category: "Fornecedores",
      amount: 720,
      dueDate: ago(20),
      status: "pago",
      paidAt: ago(20),
      createdAt: ago(22),
    },
    {
      id: "expense-9",
      description: "Aluguel do consultório",
      category: "Aluguel",
      amount: 3500,
      dueDate: future(20),
      status: "pendente",
      isRecurring: true,
      recurrence: "mensal",
      createdAt: ago(2),
    },
    {
      id: "expense-10",
      description: "Manutenção do ar-condicionado",
      category: "Outros",
      amount: 480,
      dueDate: ago(5),
      status: "pendente",
      createdAt: ago(9),
    },
    {
      id: "expense-11",
      description: "Assinatura do sistema de gestão",
      category: "Fornecedores",
      amount: 2400,
      dueDate: future(45),
      status: "pendente",
      isRecurring: true,
      recurrence: "anual",
      createdAt: ago(1),
    },
  ];
}

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
