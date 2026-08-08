import { AgendaAppointmentCard } from "@/components/agenda/agenda-appointment-card";
import { durationToRowSpan, generateTimeSlots, timeToRowIndex } from "@/lib/agenda-time";
import type { Appointment } from "@/lib/mock-agenda";

export type AgendaGridColumn = {
  key: string;
  title: string;
  subtitle?: string;
};

export function AgendaGrid({
  columns,
  appointmentsByColumn,
  onSlotClick,
  onAppointmentClick,
}: {
  columns: AgendaGridColumn[];
  appointmentsByColumn: Record<string, Appointment[]>;
  onSlotClick: (columnKey: string, time: string) => void;
  onAppointmentClick: (appointment: Appointment) => void;
}) {
  const slots = generateTimeSlots();

  return (
    <div className="flex overflow-x-auto rounded-lg border">
      <div className="bg-muted/30 flex w-16 shrink-0 flex-col border-r">
        <div className="h-12 border-b" />
        {slots.map((time) => (
          <div
            key={time}
            className="text-muted-foreground flex h-12 items-start justify-end border-b px-2 pt-1 text-[11px] last:border-b-0"
          >
            {time}
          </div>
        ))}
      </div>

      {columns.map((column) => {
        const appointments = appointmentsByColumn[column.key] ?? [];
        return (
          <div key={column.key} className="flex min-w-48 flex-1 flex-col border-r last:border-r-0">
            <div className="flex h-12 flex-col items-center justify-center border-b px-2 text-center">
              <span className="truncate text-sm font-medium">{column.title}</span>
              {column.subtitle && (
                <span className="text-muted-foreground truncate text-xs">{column.subtitle}</span>
              )}
            </div>
            <div
              className="relative grid"
              style={{ gridTemplateRows: `repeat(${slots.length}, 3rem)` }}
            >
              {slots.map((time, index) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => onSlotClick(column.key, time)}
                  className="hover:bg-muted/40 border-b last:border-b-0"
                  style={{ gridColumn: 1, gridRow: index + 1 }}
                />
              ))}
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="p-0.5"
                  style={{
                    gridColumn: 1,
                    gridRow: `${timeToRowIndex(appointment.startTime) + 1} / span ${durationToRowSpan(appointment.durationMinutes)}`,
                  }}
                >
                  <AgendaAppointmentCard
                    appointment={appointment}
                    onClick={() => onAppointmentClick(appointment)}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
