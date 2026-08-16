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
import { createItem, updateItem } from "@/lib/actions/estoque";
import {
  categories,
  categoryLabels,
  unitOptions,
  type StockCategory,
  type StockItem,
} from "@/lib/estoque-types";

export function ItemFormDialog({
  open,
  onOpenChange,
  item,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: StockItem;
  onSubmit: (item: StockItem) => void;
}) {
  const isEditing = Boolean(item);

  const [name, setName] = useState(item?.name ?? "");
  const [category, setCategory] = useState<StockCategory>(item?.category ?? categories[0].value);
  const [unit, setUnit] = useState(item?.unit ?? unitOptions[0]);
  const [quantity, setQuantity] = useState(item?.quantity ?? 0);
  const [minQuantity, setMinQuantity] = useState(item?.minQuantity ?? 0);
  const [batch, setBatch] = useState(item?.batch ?? "");
  const [expiresAt, setExpiresAt] = useState<Date | undefined>(
    item?.expiresAt ? new Date(`${item.expiresAt}T00:00:00`) : undefined,
  );
  const [supplier, setSupplier] = useState(item?.supplier ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(undefined);

    const input = {
      name,
      category,
      unit,
      quantity,
      minQuantity,
      batch: batch || undefined,
      expiresAt: expiresAt ? format(expiresAt, "yyyy-MM-dd") : undefined,
      supplier: supplier || undefined,
    };

    const result = item ? await updateItem(item.id, input) : await createItem(input);

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
          <DialogTitle>{isEditing ? "Editar item" : "Novo item"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize os dados do item de estoque."
              : "Cadastre um novo material, medicamento ou equipamento."}
          </DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="item-name">Nome</Label>
            <Input
              id="item-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex.: Dipirona 500mg"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Categoria</Label>
              <Select
                value={category}
                onValueChange={(value) => setCategory(value as StockCategory)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(value: string) => categoryLabels[value as StockCategory]}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {categories.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Unidade</Label>
              <Select value={unit} onValueChange={(value) => setUnit(value as string)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {unitOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="item-quantity">Quantidade em estoque</Label>
              <Input
                id="item-quantity"
                type="number"
                min={0}
                value={quantity}
                onChange={(event) => setQuantity(Number(event.target.value))}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="item-min">Estoque mínimo</Label>
              <Input
                id="item-min"
                type="number"
                min={0}
                value={minQuantity}
                onChange={(event) => setMinQuantity(Number(event.target.value))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="item-batch">Lote</Label>
              <Input
                id="item-batch"
                value={batch}
                onChange={(event) => setBatch(event.target.value)}
                placeholder="Opcional"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Validade</Label>
              <DatePicker
                date={expiresAt}
                onDateChange={setExpiresAt}
                placeholder="Sem validade"
                className="w-full"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="item-supplier">Fornecedor</Label>
            <Input
              id="item-supplier"
              value={supplier}
              onChange={(event) => setSupplier(event.target.value)}
              placeholder="Opcional"
            />
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : isEditing ? "Salvar alterações" : "Cadastrar item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
