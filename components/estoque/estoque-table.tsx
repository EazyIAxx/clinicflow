import { ArrowLeftRight, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { categoryLabels, type StockItem } from "@/lib/estoque-types";
import { getStockFlags, stockFlagMeta } from "@/lib/stock-status";

export function EstoqueTable({
  items,
  referenceDate,
  onEdit,
  onRegisterMovement,
  onDelete,
  canManage,
}: {
  items: StockItem[];
  referenceDate: Date;
  onEdit: (item: StockItem) => void;
  onRegisterMovement: (item: StockItem) => void;
  onDelete: (item: StockItem) => void;
  canManage: boolean;
}) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead className="text-right">Quantidade</TableHead>
            <TableHead className="text-right">Mínimo</TableHead>
            <TableHead>Validade</TableHead>
            <TableHead>Status</TableHead>
            {canManage && <TableHead className="w-10" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-muted-foreground py-10 text-center">
                Nenhum item encontrado.
              </TableCell>
            </TableRow>
          )}
          {items.map((item) => {
            const flags = getStockFlags({
              quantity: item.quantity,
              minQuantity: item.minQuantity,
              expiresAt: item.expiresAt,
              referenceDate,
            });

            return (
              <TableRow key={item.id}>
                <TableCell className="font-medium whitespace-normal">{item.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {categoryLabels[item.category]}
                </TableCell>
                <TableCell className="text-right">
                  {item.quantity} {item.unit}
                </TableCell>
                <TableCell className="text-muted-foreground text-right">
                  {item.minQuantity} {item.unit}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {item.expiresAt ? item.expiresAt.split("-").reverse().join("/") : "—"}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {flags.length === 0 ? (
                      <Badge variant="outline" className="text-muted-foreground">
                        Ok
                      </Badge>
                    ) : (
                      flags.map((flag) => {
                        const meta = stockFlagMeta[flag];
                        const Icon = meta.icon;
                        return (
                          <Badge key={flag} className={meta.badgeClassName}>
                            <Icon />
                            {meta.label}
                          </Badge>
                        );
                      })
                    )}
                  </div>
                </TableCell>
                {canManage && (
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
                        <MoreHorizontal />
                        <span className="sr-only">Ações</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(item)}>
                          <Pencil />
                          Editar item
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onRegisterMovement(item)}>
                          <ArrowLeftRight />
                          Registrar movimentação
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onClick={() => onDelete(item)}>
                          <Trash2 />
                          Remover item
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
