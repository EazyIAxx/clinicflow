import { AgendaGrid } from "@/components/agenda/agenda-grid";
import { formatDateKey, formatDayMonth, formatWeekdayShort } from "@/lib/agenda-time";
import type { Appointment, Professional } from "@/lib/agenda-types";

export function AgendaWeekGrid({
  professional,
  weekDates,
  appointments,
  onSlotClick,
  onAppointmentClick,
}: {
  professional: Professional;
  weekDates: Date[];
  appointments: Appointment[];
  onSlotClick: (dateKey: string, time: string) => void;
  onAppointmentClick: (appointment: Appointment) => void;
}) {
  const appointmentsByColumn: Record<string, Appointment[]> = {};
  for (const date of weekDates) {
    const key = formatDateKey(date);
    appointmentsByColumn[key] = appointments.filter(
      (appointment) => appointment.professionalId === professional.id && appointment.date === key,
    );
  }

  return (
    <AgendaGrid
      columns={weekDates.map((date) => ({
        key: formatDateKey(date),
        title: formatWeekdayShort(date),
        subtitle: formatDayMonth(date),
      }))}
      appointmentsByColumn={appointmentsByColumn}
      onSlotClick={onSlotClick}
      onAppointmentClick={onAppointmentClick}
    />
  );
}
