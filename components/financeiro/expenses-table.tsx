import { CircleDollarSign, MoreHorizontal, Pencil, Repeat, Trash2 } from "lucide-react";

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
import { expenseStatusMeta } from "@/lib/finance-status";
import { getExpenseDisplayStatus, type Expense } from "@/lib/financeiro-types";
import { formatCurrency } from "@/lib/utils";

const formatDate = (date: string) => date.split("-").reverse().join("/");

const recurrenceLabels = { mensal: "mensal", anual: "anual" };

export function ExpensesTable({
  expenses,
  referenceDate,
  onEdit,
  onMarkAsPaid,
  onDelete,
}: {
  expenses: Expense[];
  referenceDate: Date;
  onEdit: (expense: Expense) => void;
  onMarkAsPaid: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Descrição</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Vencimento</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-muted-foreground py-10 text-center">
                Nenhuma despesa encontrada.
              </TableCell>
            </TableRow>
          )}
          {expenses.map((expense) => {
            const displayStatus = getExpenseDisplayStatus(expense, referenceDate);
            const statusInfo = expenseStatusMeta[displayStatus];
            const isOpen = displayStatus === "pendente" || displayStatus === "atrasado";
            return (
              <TableRow key={expense.id}>
                <TableCell className="font-medium whitespace-normal">
                  {expense.description}
                  {expense.isRecurring && expense.recurrence && (
                    <p className="text-muted-foreground mt-0.5 flex items-center gap-1 text-xs font-normal">
                      <Repeat className="size-3" />
                      Recorrente · {recurrenceLabels[expense.recurrence]}
                    </p>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-muted-foreground">
                    {expense.category}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(expense.dueDate)}
                </TableCell>
                <TableCell>
                  <Badge className={statusInfo.badgeClassName}>
                    <statusInfo.icon />
                    {statusInfo.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{formatCurrency(expense.amount)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
                      <MoreHorizontal />
                      <span className="sr-only">Ações</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {isOpen && (
                        <DropdownMenuItem onClick={() => onMarkAsPaid(expense)}>
                          <CircleDollarSign />
                          Marcar como paga
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => onEdit(expense)}>
                        <Pencil />
                        Editar despesa
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive" onClick={() => onDelete(expense)}>
                        <Trash2 />
                        Remover despesa
                      </DropdownMenuItem>
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
