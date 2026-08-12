import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRelativeDate, type ActivityItem } from "@/lib/mock-dashboard";

export function RecentActivityCard({
  activity,
  referenceDate,
}: {
  activity: ActivityItem[];
  referenceDate: Date;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividade recente</CardTitle>
        <CardDescription>Últimos eventos registrados nos módulos.</CardDescription>
      </CardHeader>
      <CardContent>
        {activity.length === 0 ? (
          <p className="text-muted-foreground text-sm">Nenhuma atividade recente.</p>
        ) : (
          <ul className="flex flex-col divide-y">
            {activity.map((item) => (
              <li key={item.id} className="flex items-center gap-3 py-2.5 text-sm">
                <item.icon className="text-muted-foreground size-4 shrink-0" />
                <Link href={item.href} className="flex-1 hover:underline">
                  {item.description}
                </Link>
                <span className="text-muted-foreground text-xs whitespace-nowrap">
                  {formatRelativeDate(item.date, referenceDate)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
