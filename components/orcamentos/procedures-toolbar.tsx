import { Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ProceduresToolbar({
  search,
  onSearchChange,
  onNewProcedure,
  canManage,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  onNewProcedure: () => void;
  canManage: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="relative w-full sm:w-auto">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar procedimento..."
          className="w-full pl-8 sm:w-56"
        />
      </div>
      {canManage && (
        <Button onClick={onNewProcedure}>
          <Plus />
          Novo procedimento
        </Button>
      )}
    </div>
  );
}
