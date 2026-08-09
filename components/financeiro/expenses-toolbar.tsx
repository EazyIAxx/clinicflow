import { Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ExpensesToolbar({
  search,
  onSearchChange,
  onNewExpense,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  onNewExpense: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="relative w-full sm:w-auto">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar despesa..."
          className="w-full pl-8 sm:w-56"
        />
      </div>
      <Button onClick={onNewExpense}>
        <Plus />
        Nova despesa
      </Button>
    </div>
  );
}
