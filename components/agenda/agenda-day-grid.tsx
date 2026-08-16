import { AgendaGrid } from "@/components/agenda/agenda-grid";
import type { Appointment, Professional } from "@/lib/agenda-types";

export function AgendaDayGrid({
  professionals,
  appointments,
  onSlotClick,
  onAppointmentClick,
}: {
  professionals: Professional[];
  appointments: Appointment[];
  onSlotClick: (professionalId: string, time: string) => void;
  onAppointmentClick: (appointment: Appointment) => void;
}) {
  const appointmentsByColumn: Record<string, Appointment[]> = {};
  for (const professional of professionals) {
    appointmentsByColumn[professional.id] = appointments.filter(
      (appointment) => appointment.professionalId === professional.id,
    );
  }

  return (
    <AgendaGrid
      columns={professionals.map((professional) => ({
        key: professional.id,
        title: professional.name,
        subtitle: `${professional.specialty} · ${professional.room}`,
      }))}
      appointmentsByColumn={appointmentsByColumn}
      onSlotClick={onSlotClick}
      onAppointmentClick={onAppointmentClick}
    />
  );
}
