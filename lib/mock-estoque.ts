import { addDays, format, subDays } from "date-fns";

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

const dateKey = (date: Date) => format(date, "yyyy-MM-dd");

/**
 * Gera itens mockados com validade ancorada em `referenceDate`, para os
 * indicadores de "vencendo"/"vencido" fazerem sentido não importa quando a
 * página é aberta.
 */
export function getMockStockItems(referenceDate: Date): StockItem[] {
  const in_ = (days: number) => dateKey(addDays(referenceDate, days));

  return [
    {
      id: "item-1",
      name: "Dipirona 500mg",
      category: "medicamento",
      unit: "cx",
      quantity: 12,
      minQuantity: 10,
      batch: "L2301",
      expiresAt: in_(18),
      supplier: "Farma Distribuidora",
    },
    {
      id: "item-2",
      name: "Soro fisiológico 0,9% 500ml",
      category: "medicamento",
      unit: "frasco",
      quantity: 40,
      minQuantity: 15,
      batch: "L2288",
      expiresAt: in_(120),
      supplier: "Farma Distribuidora",
    },
    {
      id: "item-3",
      name: "Luvas de procedimento (M)",
      category: "material",
      unit: "cx",
      quantity: 6,
      minQuantity: 8,
      expiresAt: in_(200),
      supplier: "MedSupply",
    },
    {
      id: "item-4",
      name: "Máscara cirúrgica tripla",
      category: "material",
      unit: "cx",
      quantity: 25,
      minQuantity: 10,
      expiresAt: in_(300),
    },
    {
      id: "item-5",
      name: "Seringa 5ml",
      category: "material",
      unit: "cx",
      quantity: 18,
      minQuantity: 12,
    },
    {
      id: "item-6",
      name: "Álcool 70% 1L",
      category: "insumo",
      unit: "frasco",
      quantity: 9,
      minQuantity: 10,
      expiresAt: in_(-5),
      supplier: "MedSupply",
    },
    {
      id: "item-7",
      name: "Gaze estéril",
      category: "insumo",
      unit: "pacote",
      quantity: 30,
      minQuantity: 15,
    },
    {
      id: "item-8",
      name: "Anestésico local (lidocaína)",
      category: "medicamento",
      unit: "frasco",
      quantity: 5,
      minQuantity: 6,
      batch: "L2255",
      expiresAt: in_(10),
    },
    {
      id: "item-9",
      name: "Termômetro digital",
      category: "equipamento",
      unit: "un",
      quantity: 8,
      minQuantity: 3,
    },
    {
      id: "item-10",
      name: "Oxímetro de pulso",
      category: "equipamento",
      unit: "un",
      quantity: 4,
      minQuantity: 2,
    },
    {
      id: "item-11",
      name: "Vacina antitetânica",
      category: "medicamento",
      unit: "frasco",
      quantity: 14,
      minQuantity: 10,
      batch: "L2299",
      expiresAt: in_(25),
    },
    {
      id: "item-12",
      name: "Fio de sutura",
      category: "material",
      unit: "cx",
      quantity: 20,
      minQuantity: 10,
      expiresAt: in_(400),
    },
    {
      id: "item-13",
      name: "Algodão hidrófilo",
      category: "insumo",
      unit: "pacote",
      quantity: 22,
      minQuantity: 10,
    },
    {
      id: "item-14",
      name: "Esparadrapo",
      category: "insumo",
      unit: "rolo",
      quantity: 16,
      minQuantity: 8,
    },
    {
      id: "item-15",
      name: "Compressa cirúrgica",
      category: "material",
      unit: "pacote",
      quantity: 7,
      minQuantity: 10,
    },
  ];
}

/**
 * Gera movimentações mockadas ancoradas em `referenceDate` (sempre no passado
 * em relação a hoje).
 */
export function getMockMovements(referenceDate: Date): StockMovement[] {
  const ago = (days: number) => dateKey(subDays(referenceDate, days));

  return [
    {
      id: "mov-1",
      itemId: "item-1",
      type: "entrada",
      quantity: 20,
      date: ago(10),
      reason: "Compra",
      performedBy: "Ana Souza",
    },
    {
      id: "mov-2",
      itemId: "item-1",
      type: "saida",
      quantity: 8,
      date: ago(3),
      reason: "Uso em atendimento",
      performedBy: "Camila Rocha",
    },
    {
      id: "mov-3",
      itemId: "item-6",
      type: "saida",
      quantity: 3,
      date: ago(1),
      reason: "Uso em atendimento",
      performedBy: "Rafael Nunes",
    },
    {
      id: "mov-4",
      itemId: "item-8",
      type: "entrada",
      quantity: 10,
      date: ago(15),
      reason: "Compra",
      performedBy: "Ana Souza",
    },
    {
      id: "mov-5",
      itemId: "item-8",
      type: "saida",
      quantity: 5,
      date: ago(4),
      reason: "Uso em atendimento",
      performedBy: "Beatriz Lima",
    },
    {
      id: "mov-6",
      itemId: "item-3",
      type: "saida",
      quantity: 2,
      date: ago(2),
      reason: "Uso em atendimento",
      performedBy: "Thiago Alves",
    },
    {
      id: "mov-7",
      itemId: "item-11",
      type: "entrada",
      quantity: 20,
      date: ago(20),
      reason: "Compra",
      performedBy: "Ana Souza",
    },
    {
      id: "mov-8",
      itemId: "item-11",
      type: "saida",
      quantity: 6,
      date: ago(6),
      reason: "Uso em atendimento",
      performedBy: "Juliana Costa",
    },
    {
      id: "mov-9",
      itemId: "item-6",
      type: "entrada",
      quantity: 12,
      date: ago(25),
      reason: "Compra",
      performedBy: "Ana Souza",
    },
    {
      id: "mov-10",
      itemId: "item-15",
      type: "saida",
      quantity: 1,
      date: ago(7),
      reason: "Perda/vencimento",
      performedBy: "Ana Souza",
    },
  ];
}
