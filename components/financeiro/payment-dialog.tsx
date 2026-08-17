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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { registerPayment } from "@/lib/actions/financeiro";
import type { Charge, PaymentMethod } from "@/lib/financeiro-types";
import { paymentMethodLabels, paymentMethods } from "@/lib/financeiro-types";
import { formatCurrency } from "@/lib/utils";

export function PaymentDialog({
  open,
  onOpenChange,
  charge,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  charge: Charge | null;
  onSubmit: (charge: Charge) => void;
}) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [paidAt, setPaidAt] = useState<Date | undefined>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!charge) return;
    setIsSubmitting(true);
    setError(undefined);

    const result = await registerPayment(charge.id, {
      paymentMethod,
      paidAt: format(paidAt ?? new Date(), "yyyy-MM-dd"),
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
          <DialogTitle>Registrar pagamento</DialogTitle>
          <DialogDescription>
            {charge ? `${charge.description} — ${formatCurrency(charge.amount)}` : ""}
          </DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <Label>Forma de pagamento</Label>
            <Select
              value={paymentMethod}
              onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(value: string) => paymentMethodLabels[value as PaymentMethod]}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Data do pagamento</Label>
            <DatePicker date={paidAt} onDateChange={setPaidAt} className="w-full" />
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting || !charge}>
              {isSubmitting ? "Registrando..." : "Confirmar pagamento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
