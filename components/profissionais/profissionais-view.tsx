"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { ProfessionalFormDialog } from "@/components/profissionais/professional-form-dialog";
import { ProfissionaisTable } from "@/components/profissionais/profissionais-table";
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
import { setProfessionalActive } from "@/lib/actions/agenda";
import type { Professional } from "@/lib/agenda-types";

export function ProfissionaisView({
  initialProfessionals,
}: {
  initialProfessionals: Professional[];
}) {
  const router = useRouter();
  const [isToggling, startToggleTransition] = useTransition();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogKey, setDialogKey] = useState(0);
  const [editingProfessional, setEditingProfessional] = useState<Professional | undefined>(
    undefined,
  );

  const [professionalToDeactivate, setProfessionalToDeactivate] = useState<Professional | null>(
    null,
  );

  function openCreateDialog() {
    setEditingProfessional(undefined);
    setDialogKey((key) => key + 1);
    setIsDialogOpen(true);
  }

  function openEditDialog(professional: Professional) {
    setEditingProfessional(professional);
    setDialogKey((key) => key + 1);
    setIsDialogOpen(true);
  }

  function handleSuccess() {
    setIsDialogOpen(false);
    router.refresh();
  }

  function handleToggleActive(professional: Professional) {
    if (professional.active) {
      setProfessionalToDeactivate(professional);
      return;
    }
    startToggleTransition(async () => {
      await setProfessionalActive(professional.id, true);
      router.refresh();
    });
  }

  function handleConfirmDeactivate() {
    if (!professionalToDeactivate) return;
    const id = professionalToDeactivate.id;
    startToggleTransition(async () => {
      await setProfessionalActive(id, false);
      router.refresh();
    });
    setProfessionalToDeactivate(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Profissionais</CardTitle>
            <CardDescription>
              Cadastre os profissionais da clínica pra poder agendar consultas com eles na Agenda.
            </CardDescription>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus />
            Novo profissional
          </Button>
        </CardHeader>
      </Card>

      <ProfissionaisTable
        professionals={initialProfessionals}
        onEdit={openEditDialog}
        onToggleActive={handleToggleActive}
        isToggling={isToggling}
      />

      <ProfessionalFormDialog
        key={dialogKey}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        professional={editingProfessional}
        onSuccess={handleSuccess}
      />

      <AlertDialog
        open={professionalToDeactivate !== null}
        onOpenChange={(open) => {
          if (!open) setProfessionalToDeactivate(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar profissional?</AlertDialogTitle>
            <AlertDialogDescription>
              {professionalToDeactivate?.name} deixa de aparecer pra novos agendamentos, mas o
              histórico de consultas já feitas continua intacto. Dá pra reativar depois.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={isToggling} onClick={handleConfirmDeactivate}>
              Desativar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
