import {
  ArrowRight,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Play,
  Power,
  Repeat,
  Trash2,
  Users,
} from "lucide-react";

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
import type { Professional } from "@/lib/agenda-types";
import { automationStatusMeta } from "@/lib/automacao-status";
import {
  automationActionChannelMeta,
  automationConditionFieldLabels,
  automationConditionOperatorLabels,
  automationTriggerMeta,
  computeEligiblePatients,
  computeEligibleStockItems,
  type AutomationEngineAppointment,
  type AutomationEngineBudget,
  type AutomationRule,
} from "@/lib/automacao-types";
import { categoryLabels, type StockCategory, type StockItem } from "@/lib/estoque-types";
import type { Patient } from "@/lib/patient-types";

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

function conditionValueLabel(rule: AutomationRule, professionals: Professional[]) {
  if (!rule.condition) return "";
  if (rule.condition.field === "profissional") {
    return professionals.find((professional) => professional.id === rule.condition!.value)?.name
      ?? "profissional removido";
  }
  if (rule.condition.field === "categoria_estoque") {
    return categoryLabels[rule.condition.value as StockCategory] ?? rule.condition.value;
  }
  return rule.condition.value;
}

function eligibleCount(
  rule: AutomationRule,
  professionals: Professional[],
  stockItems: StockItem[],
  engineContext: {
    patients: Patient[];
    appointments: AutomationEngineAppointment[];
    budgets: AutomationEngineBudget[];
    today: Date;
  },
): number | null {
  if (rule.trigger.type === "promocao") return null;
  if (rule.trigger.type === "estoque_abaixo_minimo") {
    return computeEligibleStockItems(rule, stockItems).length;
  }
  return computeEligiblePatients(rule, engineContext).length;
}

export function AutomationsTable({
  rules,
  professionals,
  stockItems,
  engineContext,
  onEdit,
  onToggleStatus,
  onSendMessage,
  onBulkSend,
  onRunNow,
  onDelete,
  canManage,
}: {
  rules: AutomationRule[];
  professionals: Professional[];
  stockItems: StockItem[];
  engineContext: {
    patients: Patient[];
    appointments: AutomationEngineAppointment[];
    budgets: AutomationEngineBudget[];
    today: Date;
  };
  onEdit: (rule: AutomationRule) => void;
  onToggleStatus: (rule: AutomationRule) => void;
  onSendMessage: (rule: AutomationRule) => void;
  onBulkSend: (rule: AutomationRule) => void;
  onRunNow: (rule: AutomationRule) => void;
  onDelete: (rule: AutomationRule) => void;
  canManage: boolean;
}) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Regra</TableHead>
            <TableHead>Gatilho → Condição → Ação</TableHead>
            <TableHead>Status</TableHead>
            {canManage && <TableHead className="w-10" />}
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
            const eligible = eligibleCount(rule, professionals, stockItems, engineContext);
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
                          {conditionValueLabel(rule, professionals)}&quot;
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
                    {rule.targetPatientIds && rule.targetPatientIds.length > 0 && (
                      <Badge variant="outline">
                        <Users />
                        {rule.targetPatientIds.length} paciente(s) selecionado(s)
                      </Badge>
                    )}
                    {eligible !== null && (
                      <Badge
                        className={
                          eligible > 0
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400"
                            : "bg-muted text-muted-foreground"
                        }
                      >
                        {eligible} elegível(is) agora
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
                {canManage && (
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
                        {rule.action.channel === "whatsapp" && (
                          <DropdownMenuItem onClick={() => onSendMessage(rule)}>
                            <MessageCircle />
                            Enviar mensagem
                          </DropdownMenuItem>
                        )}
                        {rule.action.channel === "whatsapp" && (
                          <DropdownMenuItem onClick={() => onBulkSend(rule)}>
                            <Users />
                            Enviar em massa
                          </DropdownMenuItem>
                        )}
                        {rule.action.channel !== "whatsapp" && rule.trigger.type !== "promocao" && (
                          <DropdownMenuItem onClick={() => onRunNow(rule)}>
                            <Play />
                            Executar agora
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onClick={() => onDelete(rule)}>
                          <Trash2 />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
