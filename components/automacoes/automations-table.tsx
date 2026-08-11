import { ArrowRight, MoreHorizontal, Pencil, Power, Repeat, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { automationStatusMeta } from "@/lib/automacao-status";
import {
  automationActionChannelMeta,
  automationConditionFieldLabels,
  automationConditionOperatorLabels,
  automationTriggerMeta,
  type AutomationRule,
} from "@/lib/mock-automacoes";

function triggerLabel(rule: AutomationRule) {
  const meta = automationTriggerMeta[rule.trigger.type];
  if (rule.trigger.type === "dias_apos_consulta") {
    return `${meta.label} (${rule.trigger.days}d)`;
  }
  if (rule.trigger.type === "lembrete_consulta_confirmada") {
    return `${meta.label} (${rule.trigger.hours}h antes)`;
  }
  if (rule.trigger.type === "promocao") {
    return `${meta.label} (${rule.trigger.date.split("-").reverse().join("/")})`;
  }
  return meta.label;
}

export function AutomationsTable({
  rules,
  onEdit,
  onToggleStatus,
  onDelete,
}: {
  rules: AutomationRule[];
  onEdit: (rule: AutomationRule) => void;
  onToggleStatus: (rule: AutomationRule) => void;
  onDelete: (rule: AutomationRule) => void;
}) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Regra</TableHead>
            <TableHead>Gatilho → Condição → Ação</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rules.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-muted-foreground py-10 text-center">
                Nenhuma regra de automação encontrada.
              </TableCell>
            </TableRow>
          )}
          {rules.map((rule) => {
            const statusInfo = automationStatusMeta[rule.status];
            const TriggerIcon = automationTriggerMeta[rule.trigger.type].icon;
            const ActionIcon = automationActionChannelMeta[rule.action.channel].icon;
            return (
              <TableRow key={rule.id}>
                <TableCell className="font-medium">
                  {rule.name}
                  {rule.description && (
                    <p className="text-muted-foreground mt-0.5 text-xs font-normal">
                      {rule.description}
                    </p>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="outline">
                      <TriggerIcon />
                      {triggerLabel(rule)}
                    </Badge>
                    {rule.condition && (
                      <>
                        <ArrowRight className="text-muted-foreground size-3.5" />
                        <Badge variant="outline">
                          {automationConditionFieldLabels[rule.condition.field]}{" "}
                          {automationConditionOperatorLabels[rule.condition.operator]} &quot;
                          {rule.condition.value}&quot;
                        </Badge>
                      </>
                    )}
                    <ArrowRight className="text-muted-foreground size-3.5" />
                    <Badge variant="outline">
                      <ActionIcon />
                      {automationActionChannelMeta[rule.action.channel].label}
                      {rule.action.sendTime && ` · ${rule.action.sendTime}`}
                    </Badge>
                    {rule.action.followUp && (
                      <Badge variant="outline">
                        <Repeat />
                        follow-up em {rule.action.followUp.delayDays}d
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={statusInfo.badgeClassName}>
                    <statusInfo.icon />
                    {statusInfo.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
                      <MoreHorizontal />
                      <span className="sr-only">Ações</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(rule)}>
                        <Pencil />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onToggleStatus(rule)}>
                        <Power />
                        {rule.status === "ativa" ? "Pausar" : "Ativar"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive" onClick={() => onDelete(rule)}>
                        <Trash2 />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
