"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { AgendaDayGrid } from "@/components/agenda/agenda-day-grid";
import { AgendaLegend } from "@/components/agenda/agenda-legend";
import { AgendaToolbar, type AgendaViewMode } from "@/components/agenda/agenda-toolbar";
import { AgendaWeekGrid } from "@/components/agenda/agenda-week-grid";
import { AppointmentDetailsDialog } from "@/components/agenda/appointment-details-dialog";
import {
  NewAppointmentDialog,
  type NewAppointmentDefaults,
} from "@/components/agenda/new-appointment-dialog";
import type { Appointment, Professional } from "@/lib/agenda-types";
import { formatDateKey, getWeekDates } from "@/lib/agenda-time";
import {
  cancelAppointment,
  confirmAppointment,
  removeBlock,
  rescheduleAppointment,
} from "@/lib/actions/agenda";

export function AgendaView({
  professionals,
  initialAppointments,
  today,
  canManage,
}: {
  professionals: Professional[];
  initialAppointments: Appointment[];
  today: Date;
  canManage: boolean;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [viewMode, setViewMode] = useState<AgendaViewMode>("dia");
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState("todos");
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);

  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [newDialogDefaults, setNewDialogDefaults] = useState<NewAppointmentDefaults>();
  const [newDialogKey, setNewDialogKey] = useState(0);

  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const selectedAppointment =
    appointments.find((appointment) => appointment.id === selectedAppointmentId) ?? null;

  const professionalsById = useMemo(
    () => Object.fromEntries(professionals.map((professional) => [professional.id, professional])),
    [professionals],
  );

  const visibleProfessionals =
    selectedProfessionalId === "todos"
      ? professionals
      : professionals.filter((professional) => professional.id === selectedProfessionalId);

  const effectiveProfessional =
    (selectedProfessionalId === "todos"
      ? professionals[0]
      : professionalsById[selectedProfessionalId]) ?? professionals[0];

  const weekDates = useMemo(() => getWeekDates(selectedDate), [selectedDate]);

  function openNewDialog(defaults?: NewAppointmentDefaults) {
    setNewDialogDefaults(defaults);
    setNewDialogKey((key) => key + 1);
    setIsNewDialogOpen(true);
  }

  function handleDaySlotClick(professionalId: string, time: string) {
    if (!canManage) return;
    openNewDialog({ professionalId, date: selectedDate, time });
  }

  function handleWeekSlotClick(dateKey: string, time: string) {
    if (!canManage) return;
    openNewDialog({
      professionalId: effectiveProfessional?.id,
      date: new Date(`${dateKey}T00:00:00`),
      time,
    });
  }

  function handleCreated(appointment: Appointment) {
    setAppointments((prev) => [...prev, appointment]);
    router.refresh();
  }

  function handleConfirm(id: string) {
    startTransition(async () => {
      const result = await confirmAppointment(id);
      if (result.data) {
        setAppointments((prev) => prev.map((a) => (a.id === id ? result.data! : a)));
        router.refresh();
      }
    });
  }

  function handleCancel(id: string) {
    startTransition(async () => {
      const result = await cancelAppointment(id);
      if (result.data) {
        setAppointments((prev) => prev.map((a) => (a.id === id ? result.data! : a)));
        router.refresh();
      }
    });
  }

  function handleReschedule(id: string, date: Date, time: string) {
    startTransition(async () => {
      const result = await rescheduleAppointment(id, formatDateKey(date), time);
      if (result.data) {
        setAppointments((prev) => prev.map((a) => (a.id === id ? result.data! : a)));
        router.refresh();
      }
    });
  }

  function handleRemoveBlock(id: string) {
    startTransition(async () => {
      const result = await removeBlock(id);
      if (!result.error) {
        setAppointments((prev) => prev.filter((appointment) => appointment.id !== id));
        router.refresh();
      }
    });
  }

  const dayAppointments = appointments.filter(
    (appointment) => appointment.date === formatDateKey(selectedDate),
  );

  return (
    <div className="flex flex-col gap-4">
      <AgendaToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        date={selectedDate}
        onDateChange={setSelectedDate}
        professionals={professionals}
        selectedProfessionalId={selectedProfessionalId}
        onProfessionalChange={setSelectedProfessionalId}
        onNewAppointment={() =>
          openNewDialog({ professionalId: selectedProfessionalId, date: selectedDate })
        }
        canManage={canManage}
      />

      <AgendaLegend />

      {professionals.length === 0 && (
        <p className="text-muted-foreground rounded-lg border border-dashed p-4 text-center text-sm">
          {canManage ? (
            <>
              Nenhum profissional cadastrado ainda.{" "}
              <Link href="/profissionais" className="text-foreground font-medium hover:underline">
                Cadastre o primeiro
              </Link>
              .
            </>
          ) : (
            "Nenhum profissional cadastrado ainda."
          )}
        </p>
      )}

      {viewMode === "dia" ? (
        <AgendaDayGrid
          professionals={visibleProfessionals}
          appointments={dayAppointments}
          onSlotClick={handleDaySlotClick}
          onAppointmentClick={(appointment) => setSelectedAppointmentId(appointment.id)}
        />
      ) : (
        effectiveProfessional && (
          <AgendaWeekGrid
            professional={effectiveProfessional}
            weekDates={weekDates}
            appointments={appointments}
            onSlotClick={handleWeekSlotClick}
            onAppointmentClick={(appointment) => setSelectedAppointmentId(appointment.id)}
          />
        )
      )}

      <NewAppointmentDialog
        key={newDialogKey}
        open={isNewDialogOpen}
        onOpenChange={setIsNewDialogOpen}
        professionals={professionals}
        defaults={newDialogDefaults}
        onCreate={handleCreated}
      />

      <AppointmentDetailsDialog
        appointment={selectedAppointment}
        professional={
          selectedAppointment ? professionalsById[selectedAppointment.professionalId] : undefined
        }
        open={selectedAppointmentId !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedAppointmentId(null);
        }}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        onReschedule={handleReschedule}
        onRemoveBlock={handleRemoveBlock}
        canManage={canManage}
      />
    </div>
  );
}
