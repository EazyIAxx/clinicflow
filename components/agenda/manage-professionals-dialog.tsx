"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createProfessional, setProfessionalActive } from "@/lib/actions/agenda";
import type { Professional } from "@/lib/agenda-types";

export function ManageProfessionalsDialog({
  open,
  onOpenChange,
  professionals,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  professionals: Professional[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [room, setRoom] = useState("");
  const [error, setError] = useState<string>();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    startTransition(async () => {
      const result = await createProfessional({ name, specialty, room });
      if (result.error) {
        setError(result.error);
        return;
      }
      setName("");
      setSpecialty("");
      setRoom("");
      router.refresh();
    });
  }

  function handleDeactivate(id: string) {
    startTransition(async () => {
      await setProfessionalActive(id, false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Profissionais</DialogTitle>
          <DialogDescription>
            Cadastre os profissionais da clínica para poder agendar consultas com eles.
          </DialogDescription>
        </DialogHeader>

        {professionals.length > 0 && (
          <div className="flex max-h-48 flex-col gap-1.5 overflow-y-auto">
            {professionals.map((professional) => (
              <div
                key={professional.id}
                className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{professional.name}</span>
                  <span className="text-muted-foreground text-xs">
                    {professional.specialty} · {professional.room}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isPending}
                  onClick={() => handleDeactivate(professional.id)}
                >
                  Desativar
                </Button>
              </div>
            ))}
          </div>
        )}

        <form className="flex flex-col gap-3 border-t pt-4" onSubmit={handleSubmit}>
          <Badge className="w-fit" variant="outline">
            Novo profissional
          </Badge>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="professional-name">Nome</Label>
            <Input
              id="professional-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex.: Dra. Camila Rocha"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="professional-specialty">Especialidade</Label>
              <Input
                id="professional-specialty"
                value={specialty}
                onChange={(event) => setSpecialty(event.target.value)}
                placeholder="Ex.: Ortodontia"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="professional-room">Sala</Label>
              <Input
                id="professional-room"
                value={room}
                onChange={(event) => setRoom(event.target.value)}
                placeholder="Ex.: Consultório 1"
                required
              />
            </div>
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <Button type="submit" disabled={isPending}>
            {isPending ? "Salvando..." : "Adicionar profissional"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
