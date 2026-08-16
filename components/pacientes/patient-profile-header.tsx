import { differenceInYears } from "date-fns";
import { Pencil } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Patient } from "@/lib/patient-types";
import { patientStatusMeta } from "@/lib/patient-status";

export function PatientProfileHeader({
  patient,
  referenceDate,
  professionalName,
  onEdit,
}: {
  patient: Patient;
  referenceDate: Date;
  professionalName?: string;
  onEdit: () => void;
}) {
  const statusInfo = patientStatusMeta[patient.status];
  const age = differenceInYears(referenceDate, new Date(`${patient.birthDate}T00:00:00`));

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar size="lg" className="size-16">
            <AvatarFallback className="text-lg">{patient.initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-heading text-xl font-semibold">{patient.name}</h1>
              <Badge className={statusInfo.badgeClassName}>
                <statusInfo.icon />
                {statusInfo.label}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">
              {age} anos · {professionalName ?? "Sem profissional responsável"}
            </p>
            <p className="text-muted-foreground text-sm">
              {patient.phone}
              {patient.email ? ` · ${patient.email}` : ""}
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={onEdit}>
          <Pencil />
          Editar paciente
        </Button>
      </CardContent>
    </Card>
  );
}
