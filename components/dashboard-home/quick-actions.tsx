import { CalendarDays, Handshake, Receipt, Users } from "lucide-react";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";

const quickActions = [
  { title: "Novo agendamento", href: "/agenda", icon: CalendarDays },
  { title: "Novo paciente", href: "/pacientes", icon: Users },
  { title: "Novo orçamento", href: "/orcamentos", icon: Receipt },
  { title: "Novo lead", href: "/crm", icon: Handshake },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {quickActions.map((action) => (
        <Link key={action.href} href={action.href}>
          <Card className="hover:bg-muted/50 transition-colors">
            <CardContent className="flex flex-col items-center gap-2 py-5 text-center">
              <action.icon className="text-muted-foreground size-5" />
              <span className="text-sm font-medium">{action.title}</span>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
