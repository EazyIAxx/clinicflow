import { Ban, CircleDollarSign, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

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
import { chargeStatusMeta } from "@/lib/finance-status";
import { getChargeDisplayStatus, type Charge } from "@/lib/mock-financeiro";
import type { Patient } from "@/lib/mock-pacientes";
import { formatCurrency } from "@/lib/utils";

const formatDate = (date: string) => date.split("-").reverse().join("/");

export function ChargesTable({
  charges,
  patientsById,
  referenceDate,
  onRegisterPayment,
  onCancel,
  onEdit,
  onDelete,
}: {
  charges: Charge[];
  patientsById: Record<string, Patient>;
  referenceDate: Date;
  onRegisterPayment: (charge: Charge) => void;
  onCancel: (charge: Charge) => void;
  onEdit: (charge: Charge) => void;
  onDelete: (charge: Charge) => void;
}) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Paciente</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead>Vencimento</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {charges.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-muted-foreground py-10 text-center">
                Nenhuma cobrança encontrada.
              </TableCell>
            </TableRow>
          )}
          {charges.map((charge) => {
            const displayStatus = getChargeDisplayStatus(charge, referenceDate);
            const statusInfo = chargeStatusMeta[displayStatus];
            const isOpen = displayStatus === "pendente" || displayStatus === "atrasado";
            return (
              <TableRow key={charge.id}>
                <TableCell className="font-medium">
                  {patientsById[charge.patientId]?.name ?? "—"}
                </TableCell>
                <TableCell className="text-muted-foreground whitespace-normal">
                  {charge.description}
                </TableCell>
                <TableCell className="text-right">{formatCurrency(charge.amount)}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(charge.dueDate)}
                </TableCell>
                <TableCell>
                  <Badge className={statusInfo.badgeClassName}>
                    <statusInfo.icon />
                    {statusInfo.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
                      <MoreHorizontal />
                      <span className="sr-only">Ações</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {isOpen && (
                        <DropdownMenuItem onClick={() => onRegisterPayment(charge)}>
                          <CircleDollarSign />
                          Registrar pagamento
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => onEdit(charge)}>
                        <Pencil />
                        Editar
                      </DropdownMenuItem>
                      {isOpen && (
                        <DropdownMenuItem onClick={() => onCancel(charge)}>
                          <Ban />
                          Cancelar cobrança
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive" onClick={() => onDelete(charge)}>
                        <Trash2 />
                        Excluir
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
