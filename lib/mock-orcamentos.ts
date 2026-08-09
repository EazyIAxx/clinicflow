import { addDays, format, subDays } from "date-fns";

import type { BudgetStatus } from "@/lib/orcamento-status";

export type BudgetItem = {
  id: string;
  procedureId: string;
  quantity: number;
  /** Valor unitário no momento da criação do orçamento — pode divergir do preço atual da tabela. */
  unitPrice: number;
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
  const subtotal = budget.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const discountAmount = subtotal * (budget.discountPercent / 100);
  const total = subtotal - discountAmount;
  return { subtotal, discountAmount, total };
}

const dateKey = (date: Date) => format(date, "yyyy-MM-dd");

/**
 * Gera orçamentos mockados com validade e criação ancoradas em
 * `referenceDate` — alguns vencidos, outros ainda válidos, não importa
 * quando a página é aberta.
 */
export function getMockBudgets(referenceDate: Date): Budget[] {
  const ago = (days: number) => dateKey(subDays(referenceDate, days));
  const future = (days: number) => dateKey(addDays(referenceDate, days));

  return [
    {
      id: "budget-1",
      patientId: "pac-1",
      responsibleProfessionalId: "prof-3",
      items: [
        { id: "item-1", procedureId: "proc-6", quantity: 1, unitPrice: 250 },
        { id: "item-2", procedureId: "proc-7", quantity: 1, unitPrice: 380 },
      ],
      discountPercent: 0,
      validUntil: future(15),
      status: "enviado",
      createdAt: ago(5),
    },
    {
      id: "budget-2",
      patientId: "pac-4",
      responsibleProfessionalId: "prof-1",
      items: [
        { id: "item-3", procedureId: "proc-1", quantity: 1, unitPrice: 150 },
        { id: "item-4", procedureId: "proc-2", quantity: 1, unitPrice: 450 },
      ],
      discountPercent: 10,
      validUntil: future(10),
      status: "aprovado",
      createdAt: ago(12),
    },
    {
      id: "budget-3",
      patientId: "pac-3",
      responsibleProfessionalId: "prof-2",
      items: [{ id: "item-5", procedureId: "proc-3", quantity: 1, unitPrice: 1800 }],
      discountPercent: 5,
      validUntil: future(30),
      status: "rascunho",
      notes: "Paciente quer avaliar antes de fechar o pagamento parcelado.",
      createdAt: ago(1),
    },
    {
      id: "budget-4",
      patientId: "pac-8",
      responsibleProfessionalId: "prof-3",
      items: [{ id: "item-6", procedureId: "proc-6", quantity: 1, unitPrice: 250 }],
      discountPercent: 0,
      validUntil: ago(5),
      status: "recusado",
      notes: "Optou por não seguir com o procedimento no momento.",
      createdAt: ago(20),
    },
    {
      id: "budget-5",
      patientId: "pac-13",
      responsibleProfessionalId: "prof-5",
      items: [
        { id: "item-7", procedureId: "proc-9", quantity: 1, unitPrice: 220 },
        { id: "item-8", procedureId: "proc-10", quantity: 3, unitPrice: 180 },
      ],
      discountPercent: 15,
      validUntil: future(20),
      status: "aprovado",
      createdAt: ago(8),
    },
    {
      id: "budget-6",
      patientId: "pac-11",
      responsibleProfessionalId: "prof-2",
      items: [{ id: "item-9", procedureId: "proc-4", quantity: 1, unitPrice: 180 }],
      discountPercent: 0,
      validUntil: future(7),
      status: "enviado",
      createdAt: ago(3),
    },
    {
      id: "budget-7",
      patientId: "pac-2",
      responsibleProfessionalId: "prof-2",
      items: [{ id: "item-10", procedureId: "proc-4", quantity: 2, unitPrice: 180 }],
      discountPercent: 0,
      validUntil: ago(10),
      status: "expirado",
      createdAt: ago(40),
    },
    {
      id: "budget-8",
      patientId: "pac-14",
      responsibleProfessionalId: "prof-4",
      items: [{ id: "item-11", procedureId: "proc-8", quantity: 8, unitPrice: 130 }],
      discountPercent: 8,
      validUntil: future(25),
      status: "aprovado",
      createdAt: ago(15),
    },
    {
      id: "budget-9",
      patientId: "pac-7",
      responsibleProfessionalId: "prof-3",
      items: [
        { id: "item-12", procedureId: "proc-6", quantity: 1, unitPrice: 250 },
        { id: "item-13", procedureId: "proc-7", quantity: 1, unitPrice: 380 },
      ],
      discountPercent: 0,
      validUntil: future(30),
      status: "rascunho",
      createdAt: ago(0),
    },
    {
      id: "budget-10",
      patientId: "pac-10",
      responsibleProfessionalId: "prof-1",
      items: [{ id: "item-14", procedureId: "proc-2", quantity: 1, unitPrice: 450 }],
      discountPercent: 0,
      validUntil: ago(2),
      status: "recusado",
      createdAt: ago(18),
    },
  ];
}
