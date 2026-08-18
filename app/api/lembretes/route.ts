import { addDays, format } from "date-fns";
import { NextResponse } from "next/server";

import { getStaffUserIds, notifyUsers, sendAppointmentEmail } from "@/lib/notification-service";
import { prisma } from "@/lib/prisma";

/**
 * Job de lembretes de consulta do dia seguinte — pra cada consulta confirmada
 * de amanhã: envia e-mail ao paciente (se o e-mail for encontrado) e cria
 * uma notificação in-app pra recepcionista/gestor da clínica.
 *
 * Sem Vercel Cron configurado ainda (M19): disparado manualmente com o
 * header `Authorization: Bearer <CRON_SECRET>`. Quando o agendamento real
 * for configurado, o vercel.json chama esta mesma rota.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");
  const clinics = await prisma.clinic.findMany({ select: { id: true } });

  let emailsSent = 0;
  let notificationsCreated = 0;

  for (const clinic of clinics) {
    const appointments = await prisma.appointment.findMany({
      where: { clinicId: clinic.id, date: tomorrow, kind: "consulta", status: "confirmada" },
    });
    if (appointments.length === 0) continue;

    const staffUserIds = await getStaffUserIds(clinic.id, ["recepcionista", "gestor"]);

    for (const appointment of appointments) {
      const emailSent = await sendAppointmentEmail(clinic.id, appointment, "lembrete");
      if (emailSent) emailsSent++;

      await notifyUsers({
        clinicId: clinic.id,
        userIds: staffUserIds,
        type: "lembrete_consulta",
        title: "Consulta amanhã",
        message: `${appointment.patientName ?? "Paciente"} às ${appointment.startTime}`,
        link: "/agenda",
      });
      notificationsCreated += staffUserIds.length;
    }
  }

  return NextResponse.json({ emailsSent, notificationsCreated });
}
