import { Plus, Search, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { expenseStatusMeta, type ExpenseDisplayStatus } from "@/lib/finance-status";

const filterStatusOrder: ExpenseDisplayStatus[] = ["pendente", "atrasado", "pago"];

export function ExpensesToolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onNewExpense,
  onImportCsv,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: ExpenseDisplayStatus | "todos";
  onStatusFilterChange: (value: ExpenseDisplayStatus | "todos") => void;
  onNewExpense: () => void;
  onImportCsv: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
        <div className="relative w-full sm:w-auto">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar despesa..."
            className="w-full pl-8 sm:w-56"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) => onStatusFilterChange(value as ExpenseDisplayStatus | "todos")}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue>
              {(value: string) =>
                value === "todos"
                  ? "Todos os status"
                  : expenseStatusMeta[value as ExpenseDisplayStatus].label
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            {filterStatusOrder.map((status) => (
              <SelectItem key={status} value={status}>
                {expenseStatusMeta[status].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onImportCsv}>
          <Upload />
          Importar CSV
        </Button>
        <Button onClick={onNewExpense}>
          <Plus />
          Nova despesa
        </Button>
      </div>
    </div>
  );
}
