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
import {
  automationStatusMeta,
  automationStatusOrder,
  type AutomationStatus,
} from "@/lib/automacao-status";

export function AutomationsToolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onNewRule,
  canManage,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: AutomationStatus | "todos";
  onStatusFilterChange: (value: AutomationStatus | "todos") => void;
  onNewRule: () => void;
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
            placeholder="Buscar regra..."
            className="w-full pl-8 sm:w-56"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) => onStatusFilterChange(value as AutomationStatus | "todos")}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue>
              {(value: string) =>
                value === "todos"
                  ? "Todos os status"
                  : automationStatusMeta[value as AutomationStatus].label
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            {automationStatusOrder.map((status) => (
              <SelectItem key={status} value={status}>
                {automationStatusMeta[status].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {canManage && (
        <Button onClick={onNewRule}>
          <Plus />
          Nova regra
        </Button>
      )}
    </div>
  );
}
