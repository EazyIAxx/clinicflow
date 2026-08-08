"use client";

import { useMemo, useState } from "react";

import { AgendaDayGrid } from "@/components/agenda/agenda-day-grid";
import { AgendaLegend } from "@/components/agenda/agenda-legend";
import { AgendaToolbar, type AgendaViewMode } from "@/components/agenda/agenda-toolbar";
import { AgendaWeekGrid } from "@/components/agenda/agenda-week-grid";
import { AppointmentDetailsDialog } from "@/components/agenda/appointment-details-dialog";
import {
  NewAppointmentDialog,
  type NewAppointmentDefaults,
} from "@/components/agenda/new-appointment-dialog";
import { formatDateKey, getWeekDates } from "@/lib/agenda-time";
import type { Appointment, Professional } from "@/lib/mock-agenda";

export function AgendaView({
  professionals,
  initialAppointments,
  today,
}: {
  professionals: Professional[];
  initialAppointments: Appointment[];
  today: Date;
}) {
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
    openNewDialog({ professionalId, date: selectedDate, time });
  }

  function handleWeekSlotClick(dateKey: string, time: string) {
    openNewDialog({
      professionalId: effectiveProfessional?.id,
      date: new Date(`${dateKey}T00:00:00`),
      time,
    });
  }

  function handleCreate(appointment: Appointment) {
    setAppointments((prev) => [...prev, appointment]);
  }

  function handleConfirm(id: string) {
    setAppointments((prev) =>
      prev.map((appointment) =>
        appointment.id === id ? { ...appointment, status: "confirmada" } : appointment,
      ),
    );
  }

  function handleCancel(id: string) {
    setAppointments((prev) =>
      prev.map((appointment) =>
        appointment.id === id ? { ...appointment, status: "cancelada" } : appointment,
      ),
    );
  }

  function handleReschedule(id: string, date: Date, time: string) {
    setAppointments((prev) =>
      prev.map((appointment) =>
        appointment.id === id
          ? {
              ...appointment,
              status: "remarcada",
              rescheduledFrom: { date: appointment.date, startTime: appointment.startTime },
              date: formatDateKey(date),
              startTime: time,
            }
          : appointment,
      ),
    );
  }

  function handleRemoveBlock(id: string) {
    setAppointments((prev) => prev.filter((appointment) => appointment.id !== id));
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
      />

      <AgendaLegend />

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
        onCreate={handleCreate}
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
      />
    </div>
  );
}
