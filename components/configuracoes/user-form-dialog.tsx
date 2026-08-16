"use client";

import { useActionState, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { inviteUser, updateUser, type UserActionState } from "@/lib/actions/users";
import { userRoleLabels, userRoles, type SystemUser, type UserRole } from "@/lib/mock-usuarios";

export function UserFormDialog({
  open,
  onOpenChange,
  user,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: SystemUser;
  onSuccess: () => void;
}) {
  const isEditing = Boolean(user);
  const action = isEditing ? updateUser : inviteUser;
  const [state, formAction, isPending] = useActionState<UserActionState, FormData>(action, {});
  const [role, setRole] = useState<UserRole>(user?.role ?? "recepcionista");

  useEffect(() => {
    if (state.success) onSuccess();
  }, [state.success, onSuccess]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar usuário" : "Convidar usuário"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize os dados e o perfil de acesso do usuário."
              : "Envie um convite para um novo membro da equipe."}
          </DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-4" action={formAction}>
          {user && <input type="hidden" name="id" value={user.id} />}
          <input type="hidden" name="role" value={role} />

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="user-name">Nome</Label>
            <Input
              id="user-name"
              name="name"
              defaultValue={user?.name}
              placeholder="Ex.: Juliana Andrade"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="user-email">E-mail</Label>
            <Input
              id="user-email"
              name="email"
              type="email"
              defaultValue={user?.email}
              placeholder="voce@clinica.com"
              disabled={isEditing}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Perfil</Label>
            <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
              <SelectTrigger className="w-full">
                <SelectValue>{(value: string) => userRoleLabels[value as UserRole]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {userRoles.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {state.error && <p className="text-destructive text-sm">{state.error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isEditing ? "Salvar alterações" : "Enviar convite"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
