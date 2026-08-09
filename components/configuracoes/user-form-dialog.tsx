"use client";

import { useState, type FormEvent } from "react";

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
import { deriveInitials } from "@/lib/mock-pacientes";
import { userRoleLabels, userRoles, type SystemUser, type UserRole } from "@/lib/mock-usuarios";

export function UserFormDialog({
  open,
  onOpenChange,
  user,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: SystemUser;
  onSubmit: (user: SystemUser) => void;
}) {
  const isEditing = Boolean(user);

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [role, setRole] = useState<UserRole>(user?.role ?? "recepcionista");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    onSubmit({
      id: user?.id ?? crypto.randomUUID(),
      name,
      email,
      initials: deriveInitials(name),
      role,
      status: user?.status ?? "convite_pendente",
    });
    onOpenChange(false);
  }

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

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="user-name">Nome</Label>
            <Input
              id="user-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex.: Juliana Andrade"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="user-email">E-mail</Label>
            <Input
              id="user-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="voce@clinica.com"
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

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isEditing ? "Salvar alterações" : "Enviar convite"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
