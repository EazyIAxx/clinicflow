import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { automationTemplates, type AutomationTemplate } from "@/lib/automacao-types";

export function AutomationTemplates({
  onUseTemplate,
}: {
  onUseTemplate: (template: AutomationTemplate) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-muted-foreground text-sm font-medium">Modelos prontos</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {automationTemplates.map((template) => (
          <Card key={template.key}>
            <CardHeader>
              <template.icon className="text-muted-foreground size-5" />
              <CardTitle className="text-base">{template.name}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" onClick={() => onUseTemplate(template)}>
                Usar modelo
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
