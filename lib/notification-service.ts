import type { UserRole } from "@/lib/generated/prisma/client";
import type { NotificationType } from "@/lib/notification-types";
import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";

/** Ids dos usuários ativos da clínica com um dos perfis informados. */
export async function getStaffUserIds(clinicId: string, roles: UserRole[]): Promise<string[]> {
  const users = await prisma.user.findMany({
    where: { clinicId, role: { in: roles }, status: "ativo" },
    select: { id: true },
  });
  return users.map((user) => user.id);
}

export async function notifyUsers(params: {
  clinicId: string;
  userIds: string[];
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}): Promise<void> {
  if (params.userIds.length === 0) return;
  await prisma.notification.createMany({
    data: params.userIds.map((userId) => ({
      clinicId: params.clinicId,
      userId,
      type: params.type,
      title: params.title,
      message: params.message,
      link: params.link,
    })),
  });
}

/**
 * Casa `patientName` (texto livre na Agenda) com um Patient real pelo nome —
 * a Agenda ainda não referencia Patient.id diretamente, mesma limitação já
 * documentada no motor de automações (M18).
 */
async function findPatientEmailByName(clinicId: string, patientName: string | null | undefined) {
  if (!patientName) return undefined;
  const patient = await prisma.patient.findFirst({
    where: { clinicId, name: { equals: patientName.trim(), mode: "insensitive" } },
  });
  return patient?.email ?? undefined;
}

/**
 * E-mail de confirmação/lembrete de consulta via Resend. Silenciosamente não
 * envia nada se o paciente não tiver e-mail cadastrado ou não for
 * encontrado — a ação que chama isso (criar/confirmar agendamento, ou o job
 * de lembretes) não deve falhar por causa do e-mail.
 */
export async function sendAppointmentEmail(
  clinicId: string,
  appointment: { patientName?: string | null; date: string; startTime: string },
  kind: "confirmacao" | "lembrete",
): Promise<boolean> {
  const email = await findPatientEmailByName(clinicId, appointment.patientName);
  if (!email) return false;

  const dateLabel = appointment.date.split("-").reverse().join("/");
  const subject =
    kind === "confirmacao" ? "Consulta confirmada — ClinicFlow" : "Lembrete de consulta — ClinicFlow";
  const html =
    kind === "confirmacao"
      ? `<p>Olá, ${appointment.patientName}! Sua consulta foi confirmada para ${dateLabel} às ${appointment.startTime}.</p>`
      : `<p>Olá, ${appointment.patientName}! Lembrando que você tem uma consulta amanhã (${dateLabel}) às ${appointment.startTime}.</p>`;

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: email,
    subject,
    html,
  });

  return !error;
}
