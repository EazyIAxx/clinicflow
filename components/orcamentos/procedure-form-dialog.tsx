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
import { createProcedure, updateProcedure } from "@/lib/actions/orcamentos";
import { procedureCategories } from "@/lib/mock-procedimentos";
import type { Procedure } from "@/lib/orcamentos-types";

export function ProcedureFormDialog({
  open,
  onOpenChange,
  procedure,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  procedure?: Procedure;
  onSubmit: (procedure: Procedure) => void;
}) {
  const isEditing = Boolean(procedure);

  const [name, setName] = useState(procedure?.name ?? "");
  const [category, setCategory] = useState(procedure?.category ?? procedureCategories[0]);
  const [price, setPrice] = useState(procedure?.price ?? 0);
  const [durationMinutes, setDurationMinutes] = useState(procedure?.durationMinutes ?? 30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(undefined);

    const input = { name, category, price, durationMinutes };
    const result = procedure
      ? await updateProcedure(procedure.id, input)
      : await createProcedure(input);

    setIsSubmitting(false);

    if (result.error || !result.data) {
      setError(result.error ?? "Não foi possível salvar. Tente novamente.");
      return;
    }

    onSubmit(result.data);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar procedimento" : "Novo procedimento"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize os dados do procedimento."
              : "Cadastre um novo procedimento na tabela de preços."}
          </DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="procedure-name">Nome</Label>
            <Input
              id="procedure-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex.: Avaliação dermatológica"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Categoria</Label>
            <Select value={category} onValueChange={(value) => setCategory(value as string)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {procedureCategories.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="procedure-price">Valor (R$)</Label>
              <Input
                id="procedure-price"
                type="number"
                min={0}
                step="0.01"
                value={price}
                onChange={(event) => setPrice(Number(event.target.value))}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="procedure-duration">Duração (min)</Label>
              <Input
                id="procedure-duration"
                type="number"
                min={0}
                step={5}
                value={durationMinutes}
                onChange={(event) => setDurationMinutes(Number(event.target.value))}
                required
              />
            </div>
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Salvando..."
                : isEditing
                  ? "Salvar alterações"
                  : "Cadastrar procedimento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
