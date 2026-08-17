import type {
  Budget as BudgetRow,
  BudgetItem as BudgetItemRow,
  Procedure as ProcedureRow,
} from "@/lib/generated/prisma/client";
import type { BudgetStatus } from "@/lib/orcamento-status";

export type Procedure = {
  id: string;
  name: string;
  category: string;
  price: number;
  durationMinutes: number;
};

export type BudgetItem = {
  id: string;
  procedureId: string;
  /** Valor do item no momento da criação do orçamento — pode divergir do preço atual da tabela. */
  amount: number;
};

export type Budget = {
  id: string;
  patientId: string;
  responsibleProfessionalId?: string;
  items: BudgetItem[];
  discountPercent: number;
  validUntil: string; // yyyy-MM-dd
  status: BudgetStatus;
  notes?: string;
  createdAt: string; // yyyy-MM-dd
};

export function computeBudgetTotals(budget: Pick<Budget, "items" | "discountPercent">) {
  const subtotal = budget.items.reduce((sum, item) => sum + item.amount, 0);
  const discountAmount = subtotal * (budget.discountPercent / 100);
  const total = subtotal - discountAmount;
  return { subtotal, discountAmount, total };
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function mapProcedure(row: ProcedureRow): Procedure {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: Number(row.price),
    durationMinutes: row.durationMinutes,
  };
}

export function mapBudgetItem(row: BudgetItemRow): BudgetItem {
  return {
    id: row.id,
    procedureId: row.procedureId,
    amount: Number(row.amount),
  };
}

export function mapBudget(row: BudgetRow & { items: BudgetItemRow[] }): Budget {
  return {
    id: row.id,
    patientId: row.patientId,
    responsibleProfessionalId: row.responsibleProfessionalId ?? undefined,
    items: row.items.map(mapBudgetItem),
    discountPercent: Number(row.discountPercent),
    validUntil: row.validUntil,
    status: row.status,
    notes: row.notes ?? undefined,
    createdAt: toDateKey(row.createdAt),
  };
}
