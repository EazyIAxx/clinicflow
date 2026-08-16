"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { ClinicaForm } from "@/components/configuracoes/clinica-form";
import { PermissionsTable } from "@/components/configuracoes/permissions-table";
import { UserFormDialog } from "@/components/configuracoes/user-form-dialog";
import { UsuariosTable } from "@/components/configuracoes/usuarios-table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { removeUser } from "@/lib/actions/users";
import type { SystemUser } from "@/lib/mock-usuarios";

export function ConfiguracoesView({ initialUsers }: { initialUsers: SystemUser[] }) {
  const router = useRouter();
  const [isRemoving, startRemoveTransition] = useTransition();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogKey, setDialogKey] = useState(0);
  const [editingUser, setEditingUser] = useState<SystemUser | undefined>(undefined);

  const [userToDelete, setUserToDelete] = useState<SystemUser | null>(null);

  function openInviteDialog() {
    setEditingUser(undefined);
    setDialogKey((key) => key + 1);
    setIsDialogOpen(true);
  }

  function openEditDialog(user: SystemUser) {
    setEditingUser(user);
    setDialogKey((key) => key + 1);
    setIsDialogOpen(true);
  }

  function handleSuccess() {
    setIsDialogOpen(false);
    router.refresh();
  }

  function handleConfirmDelete() {
    if (!userToDelete) return;
    const id = userToDelete.id;
    startRemoveTransition(async () => {
      await removeUser(id);
      router.refresh();
    });
    setUserToDelete(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <Tabs defaultValue="usuarios">
        <TabsList>
          <TabsTrigger value="usuarios">Usuários</TabsTrigger>
          <TabsTrigger value="permissoes">Permissões</TabsTrigger>
          <TabsTrigger value="clinica">Clínica</TabsTrigger>
        </TabsList>

        <TabsContent value="usuarios" className="mt-4 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-muted-foreground text-sm">
              Membros da equipe com acesso ao sistema.
            </p>
            <Button onClick={openInviteDialog}>
              <Plus />
              Convidar usuário
            </Button>
          </div>
          <UsuariosTable users={initialUsers} onEdit={openEditDialog} onDelete={setUserToDelete} />
        </TabsContent>

        <TabsContent value="permissoes" className="mt-4 flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Acesso por perfil</CardTitle>
              <CardDescription>
                Referência de quais módulos cada perfil pode visualizar ou gerenciar. A aplicação
                real dessas regras (RLS) é feita no backend.
              </CardDescription>
            </CardHeader>
          </Card>
          <PermissionsTable />
        </TabsContent>

        <TabsContent value="clinica" className="mt-4">
          <ClinicaForm />
        </TabsContent>
      </Tabs>

      <UserFormDialog
        key={`user-form-${dialogKey}`}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        user={editingUser}
        onSuccess={handleSuccess}
      />

      <AlertDialog
        open={Boolean(userToDelete)}
        onOpenChange={(open) => !open && setUserToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover usuário?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover &quot;{userToDelete?.name}&quot;? Essa ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isRemoving}
              onClick={handleConfirmDelete}
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
