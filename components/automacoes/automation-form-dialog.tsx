"use client";

import { format } from "date-fns";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  automationActionChannelMeta,
  automationConditionFieldLabels,
  automationConditionOperatorLabels,
  automationTriggerMeta,
  type AutomationAction,
  type AutomationActionChannel,
  type AutomationCondition,
  type AutomationConditionField,
  type AutomationConditionOperator,
  type AutomationRule,
  type AutomationTrigger,
  type AutomationTriggerType,
} from "@/lib/mock-automacoes";

const triggerTypeOrder: AutomationTriggerType[] = [
  "dias_apos_consulta",
  "estoque_abaixo_minimo",
  "aniversario_paciente",
  "orcamento_aprovado",
];

const NO_CONDITION = "nenhuma";

const conditionFieldOrder: AutomationConditionField[] = [
  "categoria_estoque",
  "profissional",
  "valor_minimo_orcamento",
];

const conditionOperatorOrder: AutomationConditionOperator[] = ["igual", "maior_que", "menor_que"];

const actionChannelOrder: AutomationActionChannel[] = ["whatsapp", "email", "notificacao_interna"];

function buildTrigger(type: AutomationTriggerType, days: number): AutomationTrigger {
  return type === "dias_apos_consulta" ? { type, days } : { type };
}

export function AutomationFormDialog({
  open,
  onOpenChange,
  rule,
  prefill,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule?: AutomationRule;
  prefill?: Pick<AutomationRule, "name" | "description" | "trigger" | "condition" | "action">;
  onSubmit: (rule: AutomationRule) => void;
}) {
  const isEditing = Boolean(rule);
  const base = rule ?? prefill;

  const [name, setName] = useState(base?.name ?? "");
  const [description, setDescription] = useState(base?.description ?? "");
  const [triggerType, setTriggerType] = useState<AutomationTriggerType>(
    base?.trigger.type ?? "dias_apos_consulta",
  );
  const [triggerDays, setTriggerDays] = useState(
    base?.trigger.type === "dias_apos_consulta" ? base.trigger.days : 30,
  );
  const [conditionField, setConditionField] = useState<
    AutomationConditionField | typeof NO_CONDITION
  >(base?.condition?.field ?? NO_CONDITION);
  const [conditionOperator, setConditionOperator] = useState<AutomationConditionOperator>(
    base?.condition?.operator ?? "igual",
  );
  const [conditionValue, setConditionValue] = useState(base?.condition?.value ?? "");
  const [actionChannel, setActionChannel] = useState<AutomationActionChannel>(
    base?.action.channel ?? "whatsapp",
  );
  const [actionMessage, setActionMessage] = useState(base?.action.message ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const condition: AutomationCondition | null =
      conditionField === NO_CONDITION
        ? null
        : { field: conditionField, operator: conditionOperator, value: conditionValue };
    const action: AutomationAction = { channel: actionChannel, message: actionMessage };

    onSubmit({
      id: rule?.id ?? crypto.randomUUID(),
      name,
      description: description || undefined,
      trigger: buildTrigger(triggerType, triggerDays),
      condition,
      action,
      status: rule?.status ?? "ativa",
      createdAt: rule?.createdAt ?? format(new Date(), "yyyy-MM-dd"),
      lastTriggeredAt: rule?.lastTriggeredAt,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar regra" : "Nova regra de automação"}</DialogTitle>
          <DialogDescription>
            Configure o gatilho, a condição opcional e a ação disparada por esta regra.
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="automation-name">Nome</Label>
            <Input
              id="automation-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex.: Lembrete de retorno"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="automation-description">Descrição (opcional)</Label>
            <Textarea
              id="automation-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Explique o objetivo desta regra"
              rows={2}
            />
          </div>

          <div className="flex flex-col gap-2 rounded-md border p-3">
            <Label>Gatilho</Label>
            <Select
              value={triggerType}
              onValueChange={(value) => setTriggerType(value as AutomationTriggerType)}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(value: string) => automationTriggerMeta[value as AutomationTriggerType].label}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {triggerTypeOrder.map((type) => (
                  <SelectItem key={type} value={type}>
                    {automationTriggerMeta[type].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-muted-foreground text-xs">
              {automationTriggerMeta[triggerType].description}
            </p>
            {triggerType === "dias_apos_consulta" && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="automation-trigger-days" className="text-xs">
                  Dias após a consulta
                </Label>
                <Input
                  id="automation-trigger-days"
                  type="number"
                  min={1}
                  value={triggerDays}
                  onChange={(event) => setTriggerDays(Number(event.target.value))}
                  className="w-24"
                />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 rounded-md border p-3">
            <Label>Condição (opcional)</Label>
            <Select
              value={conditionField}
              onValueChange={(value) =>
                setConditionField(value as AutomationConditionField | typeof NO_CONDITION)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(value: string) =>
                    value === NO_CONDITION
                      ? "Nenhuma — sempre disparar"
                      : automationConditionFieldLabels[value as AutomationConditionField]
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_CONDITION}>Nenhuma — sempre disparar</SelectItem>
                {conditionFieldOrder.map((field) => (
                  <SelectItem key={field} value={field}>
                    {automationConditionFieldLabels[field]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {conditionField !== NO_CONDITION && (
              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={conditionOperator}
                  onValueChange={(value) =>
                    setConditionOperator(value as AutomationConditionOperator)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {(value: string) =>
                        automationConditionOperatorLabels[value as AutomationConditionOperator]
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {conditionOperatorOrder.map((operator) => (
                      <SelectItem key={operator} value={operator}>
                        {automationConditionOperatorLabels[operator]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={conditionValue}
                  onChange={(event) => setConditionValue(event.target.value)}
                  placeholder="Valor"
                  required
                />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 rounded-md border p-3">
            <Label>Ação</Label>
            <Select
              value={actionChannel}
              onValueChange={(value) => setActionChannel(value as AutomationActionChannel)}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(value: string) =>
                    automationActionChannelMeta[value as AutomationActionChannel].label
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {actionChannelOrder.map((channel) => (
                  <SelectItem key={channel} value={channel}>
                    {automationActionChannelMeta[channel].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea
              value={actionMessage}
              onChange={(event) => setActionMessage(event.target.value)}
              placeholder="Ex.: Olá {{paciente}}, vamos agendar seu retorno?"
              rows={2}
              required
            />
            <p className="text-muted-foreground text-xs">
              Use placeholders como {"{{paciente}}"}, {"{{data}}"} e {"{{item}}"} — serão
              preenchidos automaticamente quando a regra rodar.
            </p>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting || !name}>
              {isEditing ? "Salvar alterações" : "Criar regra"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
