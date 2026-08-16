"use client";

import { format } from "date-fns";
import { useState, type FormEvent } from "react";

import { DatePicker } from "@/components/shared/date-picker";
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
import { registerMovement } from "@/lib/actions/estoque";
import {
  movementReasons,
  type StockItem,
  type StockItemMovementResult,
  type StockMovementType,
} from "@/lib/estoque-types";

export function StockMovementDialog({
  open,
  onOpenChange,
  item,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: StockItem | null;
  onSubmit: (result: StockItemMovementResult) => void;
}) {
  const [type, setType] = useState<StockMovementType>("entrada");
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState(movementReasons[0]);
  const [date, setDate] = useState<Date>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  if (!item) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!item) return;
    setIsSubmitting(true);
    setError(undefined);

    const result = await registerMovement({
      itemId: item.id,
      type,
      quantity,
      date: format(date, "yyyy-MM-dd"),
      reason,
    });

    setIsSubmitting(false);

    if (result.error || !result.data) {
      setError(result.error ?? "Não foi possível registrar. Tente novamente.");
      return;
    }

    onSubmit(result.data);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Registrar movimentação</DialogTitle>
          <DialogDescription>
            {item.name} · {item.quantity} {item.unit} em estoque
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2">
          <Button
            type="button"
            variant={type === "entrada" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setType("entrada")}
          >
            Entrada
          </Button>
          <Button
            type="button"
            variant={type === "saida" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setType("saida")}
          >
            Saída
          </Button>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="movement-quantity">Quantidade</Label>
              <Input
                id="movement-quantity"
                type="number"
                min={1}
                value={quantity}
                onChange={(event) => setQuantity(Number(event.target.value))}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Data</Label>
              <DatePicker
                date={date}
                onDateChange={(value) => value && setDate(value)}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Motivo</Label>
            <Select value={reason} onValueChange={(value) => setReason(value as string)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {movementReasons.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Registrando..."
                : type === "entrada"
                  ? "Registrar entrada"
                  : "Registrar saída"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
