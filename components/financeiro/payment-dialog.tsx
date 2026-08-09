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
import type { Charge } from "@/lib/mock-financeiro";
import { paymentMethodLabels, paymentMethods, type PaymentMethod } from "@/lib/mock-financeiro";
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!charge) return;
    setIsSubmitting(true);

    onSubmit({
      ...charge,
      status: "pago",
      paymentMethod,
      paidAt: format(paidAt ?? new Date(), "yyyy-MM-dd"),
    });
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

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting || !charge}>
              Confirmar pagamento
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
