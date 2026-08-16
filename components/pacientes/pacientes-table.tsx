import { MoreHorizontal, Pencil, Trash2, UserRound } from "lucide-react";
import Link from "next/link";

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
import type { Patient } from "@/lib/patient-types";
import { patientStatusMeta } from "@/lib/patient-status";

const formatDate = (date?: string) => (date ? date.split("-").reverse().join("/") : "—");

export function PacientesTable({
  patients,
  professionalsById,
  onEdit,
  onDelete,
}: {
  patients: Patient[];
  professionalsById: Record<string, Professional>;
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
}) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Paciente</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Profissional responsável</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Última visita</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-muted-foreground py-10 text-center">
                Nenhum paciente encontrado.
              </TableCell>
            </TableRow>
          )}
          {patients.map((patient) => {
            const statusInfo = patientStatusMeta[patient.status];
            return (
              <TableRow key={patient.id}>
                <TableCell>
                  <Link
                    href={`/pacientes/${patient.id}`}
                    className="flex items-center gap-2.5 font-medium hover:underline"
                  >
                    <Avatar size="sm">
                      <AvatarFallback>{patient.initials}</AvatarFallback>
                    </Avatar>
                    {patient.name}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">{patient.phone}</TableCell>
                <TableCell className="text-muted-foreground">
                  {(patient.responsibleProfessionalId &&
                    professionalsById[patient.responsibleProfessionalId]?.name) ??
                    "—"}
                </TableCell>
                <TableCell>
                  <Badge className={statusInfo.badgeClassName}>
                    <statusInfo.icon />
                    {statusInfo.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(patient.lastVisitAt)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
                      <MoreHorizontal />
                      <span className="sr-only">Ações</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem render={<Link href={`/pacientes/${patient.id}`} />}>
                        <UserRound />
                        Ver perfil
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(patient)}>
                        <Pencil />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive" onClick={() => onDelete(patient)}>
                        <Trash2 />
                        Excluir paciente
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
