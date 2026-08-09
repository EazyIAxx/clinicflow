import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

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
import type { Procedure } from "@/lib/mock-procedimentos";
import { formatCurrency } from "@/lib/utils";

export function ProceduresTable({
  procedures,
  onEdit,
  onDelete,
}: {
  procedures: Procedure[];
  onEdit: (procedure: Procedure) => void;
  onDelete: (procedure: Procedure) => void;
}) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead className="text-right">Duração</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {procedures.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-muted-foreground py-10 text-center">
                Nenhum procedimento encontrado.
              </TableCell>
            </TableRow>
          )}
          {procedures.map((procedure) => (
            <TableRow key={procedure.id}>
              <TableCell className="font-medium whitespace-normal">{procedure.name}</TableCell>
              <TableCell className="text-muted-foreground">{procedure.category}</TableCell>
              <TableCell className="text-muted-foreground text-right">
                {procedure.durationMinutes} min
              </TableCell>
              <TableCell className="text-right">{formatCurrency(procedure.price)}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
                    <MoreHorizontal />
                    <span className="sr-only">Ações</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(procedure)}>
                      <Pencil />
                      Editar procedimento
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onClick={() => onDelete(procedure)}>
                      <Trash2 />
                      Remover procedimento
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
