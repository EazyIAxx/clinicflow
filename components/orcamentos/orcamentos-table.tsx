import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

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
import { budgetStatusMeta } from "@/lib/orcamento-status";
import { computeBudgetTotals, type Budget } from "@/lib/orcamentos-types";
import type { Patient } from "@/lib/patient-types";
import { formatCurrency } from "@/lib/utils";

const formatDate = (date: string) => date.split("-").reverse().join("/");

export function OrcamentosTable({
  budgets,
  patientsById,
  onView,
  onEdit,
  onDelete,
  canManage,
}: {
  budgets: Budget[];
  patientsById: Record<string, Patient>;
  onView: (budget: Budget) => void;
  onEdit: (budget: Budget) => void;
  onDelete: (budget: Budget) => void;
  canManage: boolean;
}) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Paciente</TableHead>
            <TableHead className="text-right">Itens</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Validade</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {budgets.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-muted-foreground py-10 text-center">
                Nenhum orçamento encontrado.
              </TableCell>
            </TableRow>
          )}
          {budgets.map((budget) => {
            const statusInfo = budgetStatusMeta[budget.status];
            const { total } = computeBudgetTotals(budget);
            return (
              <TableRow key={budget.id} className="cursor-pointer" onClick={() => onView(budget)}>
                <TableCell className="font-medium">
                  {patientsById[budget.patientId]?.name ?? "—"}
                </TableCell>
                <TableCell className="text-muted-foreground text-right">
                  {budget.items.length}
                </TableCell>
                <TableCell className="text-right">{formatCurrency(total)}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(budget.validUntil)}
                </TableCell>
                <TableCell>
                  <Badge className={statusInfo.badgeClassName}>
                    <statusInfo.icon />
                    {statusInfo.label}
                  </Badge>
                </TableCell>
                <TableCell onClick={(event) => event.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
                      <MoreHorizontal />
                      <span className="sr-only">Ações</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView(budget)}>
                        <Eye />
                        Ver orçamento
                      </DropdownMenuItem>
                      {canManage && (
                        <>
                          <DropdownMenuItem onClick={() => onEdit(budget)}>
                            <Pencil />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onClick={() => onDelete(budget)}>
                            <Trash2 />
                            Excluir
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
