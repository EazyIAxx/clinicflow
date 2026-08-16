"use client";

import { useState } from "react";

import { AgendaDatePicker } from "@/components/agenda/agenda-date-picker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { statusMeta } from "@/lib/agenda-status";
import { generateTimeSlots } from "@/lib/agenda-time";
import type { Appointment, Professional } from "@/lib/agenda-types";

function formatDisplayDate(dateKey: string): string {
  return dateKey.split("-").reverse().join("/");
}

export function AppointmentDetailsDialog({
  appointment,
  professional,
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  onReschedule,
  onRemoveBlock,
  canManage,
}: {
  appointment: Appointment | null;
  professional?: Professional;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (id: string) => void;
  onCancel: (id: string) => void;
  onReschedule: (id: string, date: Date, time: string) => void;
  onRemoveBlock: (id: string) => void;
  canManage: boolean;
}) {
  const timeSlots = generateTimeSlots();
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newDate, setNewDate] = useState<Date>(new Date());
  const [newTime, setNewTime] = useState(timeSlots[0]);

  if (!appointment) return null;

  const meta = statusMeta[appointment.status];
  const Icon = meta.icon;
  const isBlock = appointment.kind === "bloqueio";

  function startReschedule() {
    if (!appointment) return;
    setNewDate(new Date(`${appointment.date}T00:00:00`));
    setNewTime(appointment.startTime);
    setIsRescheduling(true);
  }

  function confirmReschedule() {
    if (!appointment) return;
    onReschedule(appointment.id, newDate, newTime);
    setIsRescheduling(false);
    onOpenChange(false);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) setIsRescheduling(false);
    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{isBlock ? appointment.reason : appointment.patientName}</DialogTitle>
          <DialogDescription>
            {professional?.name} · {professional?.room}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 text-sm">
          <Badge className={meta.badgeClassName}>
            <Icon />
            {meta.label}
          </Badge>

          <div className="text-muted-foreground grid grid-cols-2 gap-x-4 gap-y-1.5">
            <span>Data</span>
            <span className="text-foreground text-right">
              {formatDisplayDate(appointment.date)}
            </span>
            <span>Horário</span>
            <span className="text-foreground text-right">
              {appointment.startTime} · {appointment.durationMinutes} min
            </span>
            {!isBlock && appointment.service && (
              <>
                <span>Tipo</span>
                <span className="text-foreground text-right">{appointment.service}</span>
              </>
            )}
            {appointment.rescheduledFrom && (
              <>
                <span>Remarcada de</span>
                <span className="text-foreground text-right">
                  {formatDisplayDate(appointment.rescheduledFrom.date)} às{" "}
                  {appointment.rescheduledFrom.startTime}
                </span>
              </>
            )}
          </div>

          {appointment.notes && <p className="text-muted-foreground">{appointment.notes}</p>}

          {isRescheduling && (
            <div className="grid grid-cols-2 gap-3 rounded-lg border border-dashed p-3">
              <div className="flex flex-col gap-1.5">
                <span className="text-muted-foreground text-xs">Nova data</span>
                <AgendaDatePicker date={newDate} onDateChange={setNewDate} className="w-full" />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-muted-foreground text-xs">Novo horário</span>
                <Select value={newTime} onValueChange={(value) => setNewTime(value as string)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-wrap">
          {!canManage ? null : isBlock ? (
            <Button
              variant="destructive"
              onClick={() => {
                onRemoveBlock(appointment.id);
                onOpenChange(false);
              }}
            >
              Remover bloqueio
            </Button>
          ) : isRescheduling ? (
            <>
              <Button variant="outline" onClick={() => setIsRescheduling(false)}>
                Voltar
              </Button>
              <Button onClick={confirmReschedule}>Confirmar nova data</Button>
            </>
          ) : (
            <>
              {appointment.status !== "cancelada" && (
                <Button
                  variant="outline"
                  onClick={() => {
                    onCancel(appointment.id);
                    onOpenChange(false);
                  }}
                >
                  Cancelar consulta
                </Button>
              )}
              {appointment.status !== "cancelada" && (
                <Button variant="outline" onClick={startReschedule}>
                  Remarcar
                </Button>
              )}
              {appointment.status === "pendente" && (
                <Button
                  onClick={() => {
                    onConfirm(appointment.id);
                    onOpenChange(false);
                  }}
                >
                  Confirmar
                </Button>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
