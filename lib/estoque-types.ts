import type {
  StockItem as StockItemRow,
  StockMovement as StockMovementRow,
} from "@/lib/generated/prisma/client";

export type StockCategory = "medicamento" | "material" | "insumo" | "equipamento";

export type StockItem = {
  id: string;
  name: string;
  category: StockCategory;
  unit: string;
  quantity: number;
  minQuantity: number;
  batch?: string;
  expiresAt?: string; // yyyy-MM-dd
  supplier?: string;
};

export type StockMovementType = "entrada" | "saida";

export type StockMovement = {
  id: string;
  itemId: string;
  type: StockMovementType;
  quantity: number;
  date: string; // yyyy-MM-dd
  reason: string;
  performedBy: string;
};

export type StockItemMovementResult = {
  item: StockItem;
  movement: StockMovement;
};

export const categoryLabels: Record<StockCategory, string> = {
  medicamento: "Medicamento",
  material: "Material descartável",
  insumo: "Insumo",
  equipamento: "Equipamento",
};

export const categories = Object.entries(categoryLabels).map(([value, label]) => ({
  value: value as StockCategory,
  label,
}));

export const unitOptions = ["un", "cx", "ml", "frasco", "par", "rolo", "pacote"];

export const movementReasons = [
  "Compra",
  "Uso em atendimento",
  "Perda/vencimento",
  "Ajuste de inventário",
];

export function mapStockItem(row: StockItemRow): StockItem {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    unit: row.unit,
    quantity: row.quantity,
    minQuantity: row.minQuantity,
    batch: row.batch ?? undefined,
    expiresAt: row.expiresAt ?? undefined,
    supplier: row.supplier ?? undefined,
  };
}

export function mapStockMovement(row: StockMovementRow): StockMovement {
  return {
    id: row.id,
    itemId: row.itemId,
    type: row.type,
    quantity: row.quantity,
    date: row.date,
    reason: row.reason,
    performedBy: row.performedBy,
  };
}
