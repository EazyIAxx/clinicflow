import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { StockItem, StockMovement } from "@/lib/estoque-types";

export function MovementsTable({
  movements,
  itemsById,
}: {
  movements: StockMovement[];
  itemsById: Record<string, StockItem>;
}) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Item</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="text-right">Quantidade</TableHead>
            <TableHead>Motivo</TableHead>
            <TableHead>Responsável</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movements.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-muted-foreground py-10 text-center">
                Nenhuma movimentação registrada.
              </TableCell>
            </TableRow>
          )}
          {movements.map((movement) => (
            <TableRow key={movement.id}>
              <TableCell className="text-muted-foreground">
                {movement.date.split("-").reverse().join("/")}
              </TableCell>
              <TableCell className="font-medium">
                {itemsById[movement.itemId]?.name ?? "—"}
              </TableCell>
              <TableCell>
                {movement.type === "entrada" ? (
                  <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400">
                    <ArrowDownCircle />
                    Entrada
                  </Badge>
                ) : (
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-400">
                    <ArrowUpCircle />
                    Saída
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                {movement.quantity} {itemsById[movement.itemId]?.unit}
              </TableCell>
              <TableCell className="text-muted-foreground">{movement.reason}</TableCell>
              <TableCell className="text-muted-foreground">{movement.performedBy}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
