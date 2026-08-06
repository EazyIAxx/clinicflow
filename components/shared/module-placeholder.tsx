import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type MockStat = {
  label: string;
  value: string;
};

export function ModulePlaceholder({
  title,
  description,
  milestone,
  stats,
}: {
  title: string;
  description: string;
  milestone: string;
  stats?: MockStat[];
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <Badge variant="outline">Chega no {milestone}</Badge>
      </div>

      {stats && stats.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader>
                <CardDescription>{stat.label}</CardDescription>
                <CardTitle className="text-2xl">{stat.value}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center gap-1 py-16 text-center">
          <p className="text-sm font-medium text-foreground">Em construção</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            A interface completa deste módulo será implementada no milestone {milestone}, conforme
            o docs/PLAN.md.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
