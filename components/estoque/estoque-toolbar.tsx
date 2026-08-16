import { Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categories, categoryLabels, type StockCategory } from "@/lib/estoque-types";

export function EstoqueToolbar({
  search,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  onNewItem,
  canManage,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  categoryFilter: StockCategory | "todas";
  onCategoryFilterChange: (value: StockCategory | "todas") => void;
  onNewItem: () => void;
  canManage: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
        <div className="relative w-full sm:w-auto">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar item..."
            className="w-full pl-8 sm:w-56"
          />
        </div>
        <Select
          value={categoryFilter}
          onValueChange={(value) => onCategoryFilterChange(value as StockCategory | "todas")}
        >
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue>
              {(value: string) =>
                value === "todas" ? "Todas as categorias" : categoryLabels[value as StockCategory]
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as categorias</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {canManage && (
        <Button onClick={onNewItem}>
          <Plus />
          Novo item
        </Button>
      )}
    </div>
  );
}
