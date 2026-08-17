"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth";
import type { ChargeStatus, ExpenseStatus } from "@/lib/finance-status";
import {
  categoryToPrisma,
  mapCharge,
  mapExpense,
  type Charge,
  type ChargeSourceType,
  type Expense,
  type ExpenseCategory,
  type ExpenseRecurrence,
  type PaymentMethod,
} from "@/lib/financeiro-types";
import { prisma } from "@/lib/prisma";

export type FinanceiroActionState<T = undefined> = {
  error?: string;
  data?: T;
};

async function requireFinanceiroManager() {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "gestor") {
    return null;
  }
  return currentUser;
}

type ChargeInput = {
  patientId: string;
  sourceType: ChargeSourceType;
  budgetId?: string;
  description: string;
  amount: number;
  dueDate: string;
  status: ChargeStatus;
};

export async function createCharge(input: ChargeInput): Promise<FinanceiroActionState<Charge>> {
  const currentUser = await requireFinanceiroManager();
  if (!currentUser) return { error: "Você não tem permissão para criar cobranças." };
  if (!input.description.trim()) return { error: "Preencha a descrição da cobrança." };

  const row = await prisma.charge.create({
    data: {
      clinicId: currentUser.clinicId,
      patientId: input.patientId,
      sourceType: input.sourceType,
      budgetId: input.sourceType === "orcamento" ? input.budgetId || undefined : undefined,
      description: input.description.trim(),
      amount: input.amount,
      dueDate: input.dueDate,
      status: input.status,
    },
  });

  revalidatePath("/financeiro");
  return { data: mapCharge(row) };
}

export async function updateCharge(
  id: string,
  input: ChargeInput,
): Promise<FinanceiroActionState<Charge>> {
  const currentUser = await requireFinanceiroManager();
  if (!currentUser) return { error: "Você não tem permissão para editar cobranças." };
  if (!input.description.trim()) return { error: "Preencha a descrição da cobrança." };

  const row = await prisma.charge.update({
    where: { id, clinicId: currentUser.clinicId },
    data: {
      patientId: input.patientId,
      sourceType: input.sourceType,
      budgetId: input.sourceType === "orcamento" ? input.budgetId || undefined : null,
      description: input.description.trim(),
      amount: input.amount,
      dueDate: input.dueDate,
      status: input.status,
    },
  });

  revalidatePath("/financeiro");
  return { data: mapCharge(row) };
}

export async function deleteCharge(id: string): Promise<FinanceiroActionState> {
  const currentUser = await requireFinanceiroManager();
  if (!currentUser) return { error: "Você não tem permissão para remover cobranças." };

  await prisma.charge.delete({ where: { id, clinicId: currentUser.clinicId } });

  revalidatePath("/financeiro");
  return {};
}

export async function cancelCharge(id: string): Promise<FinanceiroActionState<Charge>> {
  const currentUser = await requireFinanceiroManager();
  if (!currentUser) return { error: "Você não tem permissão para cancelar cobranças." };

  const row = await prisma.charge.update({
    where: { id, clinicId: currentUser.clinicId },
    data: { status: "cancelado" },
  });

  revalidatePath("/financeiro");
  return { data: mapCharge(row) };
}

export async function registerPayment(
  id: string,
  input: { paymentMethod: PaymentMethod; paidAt: string },
): Promise<FinanceiroActionState<Charge>> {
  const currentUser = await requireFinanceiroManager();
  if (!currentUser) return { error: "Você não tem permissão para registrar pagamentos." };

  const row = await prisma.charge.update({
    where: { id, clinicId: currentUser.clinicId },
    data: { status: "pago", paymentMethod: input.paymentMethod, paidAt: input.paidAt },
  });

  revalidatePath("/financeiro");
  return { data: mapCharge(row) };
}

type ExpenseInput = {
  description: string;
  category: ExpenseCategory;
  amount: number;
  dueDate: string;
  status: ExpenseStatus;
  isRecurring?: boolean;
  recurrence?: ExpenseRecurrence;
};

export async function createExpense(input: ExpenseInput): Promise<FinanceiroActionState<Expense>> {
  const currentUser = await requireFinanceiroManager();
  if (!currentUser) return { error: "Você não tem permissão para criar despesas." };
  if (!input.description.trim()) return { error: "Preencha a descrição da despesa." };

  const row = await prisma.expense.create({
    data: {
      clinicId: currentUser.clinicId,
      description: input.description.trim(),
      category: categoryToPrisma(input.category),
      amount: input.amount,
      dueDate: input.dueDate,
      status: input.status,
      isRecurring: input.isRecurring ?? false,
      recurrence: input.recurrence,
    },
  });

  revalidatePath("/financeiro");
  return { data: mapExpense(row) };
}

export async function updateExpense(
  id: string,
  input: ExpenseInput,
): Promise<FinanceiroActionState<Expense>> {
  const currentUser = await requireFinanceiroManager();
  if (!currentUser) return { error: "Você não tem permissão para editar despesas." };
  if (!input.description.trim()) return { error: "Preencha a descrição da despesa." };

  const row = await prisma.expense.update({
    where: { id, clinicId: currentUser.clinicId },
    data: {
      description: input.description.trim(),
      category: categoryToPrisma(input.category),
      amount: input.amount,
      dueDate: input.dueDate,
      status: input.status,
      isRecurring: input.isRecurring ?? false,
      recurrence: input.recurrence ?? null,
    },
  });

  revalidatePath("/financeiro");
  return { data: mapExpense(row) };
}

export async function deleteExpense(id: string): Promise<FinanceiroActionState> {
  const currentUser = await requireFinanceiroManager();
  if (!currentUser) return { error: "Você não tem permissão para remover despesas." };

  await prisma.expense.delete({ where: { id, clinicId: currentUser.clinicId } });

  revalidatePath("/financeiro");
  return {};
}

export async function markExpensePaid(
  id: string,
  paidAt: string,
): Promise<FinanceiroActionState<Expense>> {
  const currentUser = await requireFinanceiroManager();
  if (!currentUser) return { error: "Você não tem permissão para marcar despesas como pagas." };

  const row = await prisma.expense.update({
    where: { id, clinicId: currentUser.clinicId },
    data: { status: "pago", paidAt },
  });

  revalidatePath("/financeiro");
  return { data: mapExpense(row) };
}
