"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth";
import {
  mapStockItem,
  mapStockMovement,
  type StockCategory,
  type StockItem,
  type StockItemMovementResult,
} from "@/lib/estoque-types";
import { prisma } from "@/lib/prisma";

export type EstoqueActionState<T = undefined> = {
  error?: string;
  data?: T;
};

async function requireEstoqueManager() {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "gestor") {
    return null;
  }
  return currentUser;
}

type ItemInput = {
  name: string;
  category: StockCategory;
  unit: string;
  quantity: number;
  minQuantity: number;
  batch?: string;
  expiresAt?: string;
  supplier?: string;
};

function validateItemInput(input: ItemInput): string | undefined {
  if (!input.name.trim() || !input.unit.trim()) {
    return "Preencha nome e unidade.";
  }
  if (input.quantity < 0 || input.minQuantity < 0) {
    return "Quantidades não podem ser negativas.";
  }
  return undefined;
}

export async function createItem(input: ItemInput): Promise<EstoqueActionState<StockItem>> {
  const currentUser = await requireEstoqueManager();
  if (!currentUser) {
    return { error: "Você não tem permissão para cadastrar itens de estoque." };
  }

  const validationError = validateItemInput(input);
  if (validationError) return { error: validationError };

  const row = await prisma.stockItem.create({
    data: {
      clinicId: currentUser.clinicId,
      name: input.name.trim(),
      category: input.category,
      unit: input.unit,
      quantity: input.quantity,
      minQuantity: input.minQuantity,
      batch: input.batch || undefined,
      expiresAt: input.expiresAt || undefined,
      supplier: input.supplier || undefined,
    },
  });

  revalidatePath("/estoque");
  return { data: mapStockItem(row) };
}

export async function updateItem(
  id: string,
  input: ItemInput,
): Promise<EstoqueActionState<StockItem>> {
  const currentUser = await requireEstoqueManager();
  if (!currentUser) {
    return { error: "Você não tem permissão para editar itens de estoque." };
  }

  const validationError = validateItemInput(input);
  if (validationError) return { error: validationError };

  const row = await prisma.stockItem.update({
    where: { id, clinicId: currentUser.clinicId },
    data: {
      name: input.name.trim(),
      category: input.category,
      unit: input.unit,
      quantity: input.quantity,
      minQuantity: input.minQuantity,
      batch: input.batch || null,
      expiresAt: input.expiresAt || null,
      supplier: input.supplier || null,
    },
  });

  revalidatePath("/estoque");
  return { data: mapStockItem(row) };
}

export async function deleteItem(id: string): Promise<EstoqueActionState> {
  const currentUser = await requireEstoqueManager();
  if (!currentUser) {
    return { error: "Você não tem permissão para remover itens de estoque." };
  }

  await prisma.stockItem.delete({ where: { id, clinicId: currentUser.clinicId } });

  revalidatePath("/estoque");
  return {};
}

export async function registerMovement(input: {
  itemId: string;
  type: "entrada" | "saida";
  quantity: number;
  date: string;
  reason: string;
}): Promise<EstoqueActionState<StockItemMovementResult>> {
  const currentUser = await requireEstoqueManager();
  if (!currentUser) {
    return { error: "Você não tem permissão para registrar movimentações." };
  }
  if (input.quantity <= 0) {
    return { error: "A quantidade precisa ser maior que zero." };
  }

  const result = await prisma.$transaction(async (tx) => {
    const item = await tx.stockItem.findUnique({
      where: { id: input.itemId, clinicId: currentUser.clinicId },
    });
    if (!item) {
      return { error: "Item não encontrado." };
    }
    if (input.type === "saida" && input.quantity > item.quantity) {
      return {
        error: `Quantidade insuficiente em estoque (disponível: ${item.quantity} ${item.unit}).`,
      };
    }

    const newQuantity =
      input.type === "entrada" ? item.quantity + input.quantity : item.quantity - input.quantity;

    const updatedItem = await tx.stockItem.update({
      where: { id: item.id },
      data: { quantity: newQuantity },
    });
    const movement = await tx.stockMovement.create({
      data: {
        clinicId: currentUser.clinicId,
        itemId: item.id,
        type: input.type,
        quantity: input.quantity,
        date: input.date,
        reason: input.reason,
        performedBy: currentUser.name,
      },
    });

    return { updatedItem, movement };
  });

  if ("error" in result) return { error: result.error };

  revalidatePath("/estoque");
  return {
    data: { item: mapStockItem(result.updatedItem), movement: mapStockMovement(result.movement) },
  };
}
