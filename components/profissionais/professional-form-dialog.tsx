"use client";

import { useActionState, useEffect } from "react";

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
  createProfessional,
  updateProfessional,
  type ProfessionalActionState,
} from "@/lib/actions/agenda";
import type { Professional } from "@/lib/agenda-types";

export function ProfessionalFormDialog({
  open,
  onOpenChange,
  professional,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  professional?: Professional;
  onSuccess: () => void;
}) {
  const isEditing = Boolean(professional);
  const action = isEditing ? updateProfessional : createProfessional;
  const [state, formAction, isPending] = useActionState<ProfessionalActionState, FormData>(
    action,
    {},
  );

  useEffect(() => {
    if (state.success) onSuccess();
  }, [state.success, onSuccess]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar profissional" : "Novo profissional"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize os dados do profissional."
              : "Cadastre um profissional pra poder agendar consultas com ele."}
          </DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-4" action={formAction}>
          {professional && <input type="hidden" name="id" value={professional.id} />}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="professional-name">Nome</Label>
            <Input
              id="professional-name"
              name="name"
              defaultValue={professional?.name}
              placeholder="Ex.: Dra. Camila Rocha"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="professional-specialty">Especialidade</Label>
              <Input
                id="professional-specialty"
                name="specialty"
                defaultValue={professional?.specialty}
                placeholder="Ex.: Ortodontia"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="professional-room">Sala</Label>
              <Input
                id="professional-room"
                name="room"
                defaultValue={professional?.room}
                placeholder="Ex.: Consultório 1"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="professional-license">Registro profissional (opcional)</Label>
            <Input
              id="professional-license"
              name="licenseNumber"
              defaultValue={professional?.licenseNumber}
              placeholder="Ex.: CRM 12345-SP, CRO 6789-SP..."
            />
          </div>

          {state.error && <p className="text-destructive text-sm">{state.error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : isEditing ? "Salvar alterações" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
