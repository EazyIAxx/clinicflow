import { ShieldAlert } from "lucide-react";
import type { Metadata } from "next";

import { RelatoriosView } from "@/components/relatorios/relatorios-view";
import { Card, CardContent } from "@/components/ui/card";
import { mapAppointment, mapProfessional } from "@/lib/agenda-types";
import { getCurrentUser } from "@/lib/auth";
import { mapStockItem, mapStockMovement } from "@/lib/estoque-types";
import { mapDocument, mapPatient } from "@/lib/patient-types";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Relatórios — ClinicFlow",
};

// As métricas ("consultas no mês", "esta semana" etc.) precisam refletir a
// data real de cada acesso, não a do build.
export const dynamic = "force-dynamic";

export default async function RelatoriosPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "gestor") {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center gap-2 py-16 text-center">
          <ShieldAlert className="text-muted-foreground size-8" />
          <p className="text-foreground text-sm font-medium">Acesso restrito</p>
          <p className="text-muted-foreground max-w-sm text-sm">
            Só o perfil Gestor/Admin pode acessar os relatórios da clínica.
          </p>
        </CardContent>
      </Card>
    );
  }

  const today = new Date();

  const [
    appointmentRows,
    stockItemRows,
    movementRows,
    patientRows,
    professionalRows,
    documentRows,
  ] = await Promise.all([
    prisma.appointment.findMany({ where: { clinicId: currentUser.clinicId } }),
    prisma.stockItem.findMany({ where: { clinicId: currentUser.clinicId } }),
    prisma.stockMovement.findMany({ where: { clinicId: currentUser.clinicId } }),
    prisma.patient.findMany({ where: { clinicId: currentUser.clinicId } }),
    prisma.professional.findMany({ where: { clinicId: currentUser.clinicId } }),
    prisma.document.findMany({ where: { clinicId: currentUser.clinicId } }),
  ]);

  return (
    <RelatoriosView
      appointments={appointmentRows.map(mapAppointment)}
      items={stockItemRows.map(mapStockItem)}
      movements={movementRows.map(mapStockMovement)}
      patients={patientRows.map(mapPatient)}
      professionals={professionalRows.map(mapProfessional)}
      documents={documentRows.map(mapDocument)}
      referenceDate={today}
    />
  );
}
