import { Ban, MoreHorizontal, Pencil, RotateCcw } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import type { Professional } from "@/lib/agenda-types";

export function ProfissionaisTable({
  professionals,
  onEdit,
  onToggleActive,
  isToggling,
}: {
  professionals: Professional[];
  onEdit: (professional: Professional) => void;
  onToggleActive: (professional: Professional) => void;
  isToggling: boolean;
}) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Profissional</TableHead>
            <TableHead>Especialidade</TableHead>
            <TableHead>Sala</TableHead>
            <TableHead>Registro</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {professionals.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-muted-foreground py-10 text-center">
                Nenhum profissional cadastrado ainda.
              </TableCell>
            </TableRow>
          )}
          {professionals.map((professional) => (
            <TableRow key={professional.id}>
              <TableCell>
                <div className="flex items-center gap-2.5 font-medium">
                  <Avatar size="sm">
                    <AvatarFallback>{professional.initials}</AvatarFallback>
                  </Avatar>
                  {professional.name}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">{professional.specialty}</TableCell>
              <TableCell className="text-muted-foreground">{professional.room}</TableCell>
              <TableCell className="text-muted-foreground">
                {professional.licenseNumber || "—"}
              </TableCell>
              <TableCell>
                {professional.active ? (
                  <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400">
                    Ativo
                  </Badge>
                ) : (
                  <Badge className="bg-muted text-muted-foreground">Inativo</Badge>
                )}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
                    <MoreHorizontal />
                    <span className="sr-only">Ações</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(professional)}>
                      <Pencil />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {professional.active ? (
                      <DropdownMenuItem
                        variant="destructive"
                        disabled={isToggling}
                        onClick={() => onToggleActive(professional)}
                      >
                        <Ban />
                        Desativar
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        disabled={isToggling}
                        onClick={() => onToggleActive(professional)}
                      >
                        <RotateCcw />
                        Reativar
                      </DropdownMenuItem>
                    )}
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
