import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { statusMeta } from "@/lib/agenda-status";
import { formatFullDate } from "@/lib/agenda-time";
import { getTodayAgendaSummary } from "@/lib/mock-dashboard";
import type { Appointment, Professional } from "@/lib/mock-agenda";

const MAX_VISIBLE = 6;

export function AgendaSummaryCard({
  appointments,
  professionals,
  referenceDate,
}: {
  appointments: Appointment[];
  professionals: Professional[];
  referenceDate: Date;
}) {
  const { todayAppointments, pendingConfirmationCount } = getTodayAgendaSummary(
    appointments,
    referenceDate,
  );
  const professionalsById = Object.fromEntries(
    professionals.map((professional) => [professional.id, professional]),
  );
  const visible = todayAppointments.slice(0, MAX_VISIBLE);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agenda de hoje</CardTitle>
        <CardDescription>{formatFullDate(referenceDate)}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <span>
            <strong className="text-foreground">{todayAppointments.length}</strong> consultas hoje
          </span>
          <span>
            <strong className="text-foreground">{pendingConfirmationCount}</strong> aguardando
            confirmação
          </span>
        </div>

        {visible.length === 0 ? (
          <p className="text-muted-foreground text-sm">Nenhuma consulta agendada para hoje.</p>
        ) : (
          <ul className="flex flex-col divide-y">
            {visible.map((appointment) => {
              const info = statusMeta[appointment.status];
              return (
                <li
                  key={appointment.id}
                  className="flex items-center justify-between gap-3 py-2 text-sm"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{appointment.patientName}</span>
                    <span className="text-muted-foreground text-xs">
                      {appointment.startTime} ·{" "}
                      {professionalsById[appointment.professionalId]?.name ?? ""}
                    </span>
                  </div>
                  <Badge className={info.badgeClassName}>
                    <info.icon />
                    {info.label}
                  </Badge>
                </li>
              );
            })}
          </ul>
        )}

        <Link href="/agenda" className="text-primary text-sm font-medium hover:underline">
          Ver agenda completa →
        </Link>
      </CardContent>
    </Card>
  );
}
