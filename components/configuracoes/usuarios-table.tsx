import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

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
import { userAccountStatusMeta, userRoleLabels, type SystemUser } from "@/lib/mock-usuarios";

export function UsuariosTable({
  users,
  onEdit,
  onDelete,
}: {
  users: SystemUser[];
  onEdit: (user: SystemUser) => void;
  onDelete: (user: SystemUser) => void;
}) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuário</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>Perfil</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-muted-foreground py-10 text-center">
                Nenhum usuário encontrado.
              </TableCell>
            </TableRow>
          )}
          {users.map((user) => {
            const statusInfo = userAccountStatusMeta[user.status];
            return (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-2.5 font-medium">
                    <Avatar size="sm">
                      <AvatarFallback>{user.initials}</AvatarFallback>
                    </Avatar>
                    {user.name}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                <TableCell className="text-muted-foreground">{userRoleLabels[user.role]}</TableCell>
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
                      <DropdownMenuItem onClick={() => onEdit(user)}>
                        <Pencil />
                        Editar perfil
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive" onClick={() => onDelete(user)}>
                        <Trash2 />
                        Remover usuário
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
