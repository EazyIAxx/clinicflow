"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { AutomationFormDialog } from "@/components/automacoes/automation-form-dialog";
import { AutomationTemplates } from "@/components/automacoes/automation-templates";
import { AutomationsTable } from "@/components/automacoes/automations-table";
import { AutomationsToolbar } from "@/components/automacoes/automations-toolbar";
import { BulkSendWhatsAppDialog } from "@/components/automacoes/bulk-send-whatsapp-dialog";
import { SendWhatsAppDialog } from "@/components/automacoes/send-whatsapp-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteAutomationRule, runAutomationNow, toggleAutomationStatus } from "@/lib/actions/automacoes";
import type { Professional } from "@/lib/agenda-types";
import type { AutomationStatus } from "@/lib/automacao-status";
import type {
  AutomationEngineAppointment,
  AutomationEngineBudget,
  AutomationRule,
  AutomationTemplate,
} from "@/lib/automacao-types";
import type { StockItem } from "@/lib/estoque-types";
import type { Patient } from "@/lib/patient-types";

export function AutomacoesView({
  initialRules,
  patients,
  professionals,
  stockItems,
  appointments,
  budgets,
  canManage,
}: {
  initialRules: AutomationRule[];
  patients: Patient[];
  professionals: Professional[];
  stockItems: StockItem[];
  appointments: AutomationEngineAppointment[];
  budgets: AutomationEngineBudget[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [rules, setRules] = useState<AutomationRule[]>(initialRules);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<AutomationStatus | "todos">("todos");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [editingRule, setEditingRule] = useState<AutomationRule | undefined>(undefined);
  const [prefill, setPrefill] = useState<
    Pick<AutomationRule, "name" | "description" | "trigger" | "condition" | "action"> | undefined
  >(undefined);

  const [ruleToDelete, setRuleToDelete] = useState<AutomationRule | null>(null);

  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [sendDialogKey, setSendDialogKey] = useState(0);
  const [ruleToSend, setRuleToSend] = useState<AutomationRule | null>(null);

  const [isBulkSendDialogOpen, setIsBulkSendDialogOpen] = useState(false);
  const [bulkSendDialogKey, setBulkSendDialogKey] = useState(0);
  const [ruleToBulkSend, setRuleToBulkSend] = useState<AutomationRule | null>(null);

  const [runResult, setRunResult] = useState<{
    ruleName: string;
    sent: number;
    skippedNoEmail: number;
    skippedSendError: number;
  } | null>(null);
  const [runError, setRunError] = useState<{ ruleName: string; message: string } | null>(null);

  const engineContext = { patients, appointments, budgets, today: new Date() };

  const filteredRules = rules.filter((rule) => {
    const matchesSearch = rule.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "todos" || rule.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  function openNewRuleDialog() {
    setEditingRule(undefined);
    setPrefill(undefined);
    setFormKey((key) => key + 1);
    setIsFormOpen(true);
  }

  function openEditRuleDialog(rule: AutomationRule) {
    setEditingRule(rule);
    setPrefill(undefined);
    setFormKey((key) => key + 1);
    setIsFormOpen(true);
  }

  function openTemplateDialog(template: AutomationTemplate) {
    setEditingRule(undefined);
    setPrefill(template.build());
    setFormKey((key) => key + 1);
    setIsFormOpen(true);
  }

  function handleRuleSubmit(rule: AutomationRule) {
    setRules((prev) => {
      const exists = prev.some((existing) => existing.id === rule.id);
      return exists
        ? prev.map((existing) => (existing.id === rule.id ? rule : existing))
        : [...prev, rule];
    });
    router.refresh();
  }

  function handleToggleStatus(rule: AutomationRule) {
    startTransition(async () => {
      const result = await toggleAutomationStatus(rule.id);
      if (result.data) {
        setRules((prev) => prev.map((existing) => (existing.id === rule.id ? result.data! : existing)));
        router.refresh();
      }
    });
  }

  function openSendDialog(rule: AutomationRule) {
    setRuleToSend(rule);
    setSendDialogKey((key) => key + 1);
    setIsSendDialogOpen(true);
  }

  function openBulkSendDialog(rule: AutomationRule) {
    setRuleToBulkSend(rule);
    setBulkSendDialogKey((key) => key + 1);
    setIsBulkSendDialogOpen(true);
  }

  function handleRuleSubmitAndSend(rule: AutomationRule) {
    handleRuleSubmit(rule);
    openBulkSendDialog(rule);
  }

  function handleRunNow(rule: AutomationRule) {
    startTransition(async () => {
      const result = await runAutomationNow(rule.id);
      if (result.data) {
        setRunResult({
          ruleName: rule.name,
          sent: result.data.sent,
          skippedNoEmail: result.data.skippedNoEmail,
          skippedSendError: result.data.skippedSendError,
        });
        router.refresh();
      } else if (result.error) {
        setRunError({ ruleName: rule.name, message: result.error });
      }
    });
  }

  function handleConfirmDelete() {
    if (!ruleToDelete) return;
    const id = ruleToDelete.id;
    startTransition(async () => {
      const result = await deleteAutomationRule(id);
      if (!result.error) {
        setRules((prev) => prev.filter((existing) => existing.id !== id));
        router.refresh();
      }
    });
    setRuleToDelete(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <AutomationTemplates onUseTemplate={openTemplateDialog} />

      <AutomationsToolbar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onNewRule={openNewRuleDialog}
        canManage={canManage}
      />

      <AutomationsTable
        rules={filteredRules}
        professionals={professionals}
        stockItems={stockItems}
        engineContext={engineContext}
        onEdit={openEditRuleDialog}
        onToggleStatus={handleToggleStatus}
        onSendMessage={openSendDialog}
        onBulkSend={openBulkSendDialog}
        onRunNow={handleRunNow}
        onDelete={setRuleToDelete}
        canManage={canManage}
      />

      <AutomationFormDialog
        key={`automation-form-${formKey}`}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        rule={editingRule}
        prefill={prefill}
        patients={patients}
        professionals={professionals}
        onSubmit={handleRuleSubmit}
        onSubmitAndSend={handleRuleSubmitAndSend}
      />

      <SendWhatsAppDialog
        key={`send-whatsapp-${sendDialogKey}`}
        open={isSendDialogOpen}
        onOpenChange={setIsSendDialogOpen}
        rule={ruleToSend}
        patients={patients}
        engineContext={engineContext}
      />

      <BulkSendWhatsAppDialog
        key={`bulk-send-whatsapp-${bulkSendDialogKey}`}
        open={isBulkSendDialogOpen}
        onOpenChange={setIsBulkSendDialogOpen}
        rule={ruleToBulkSend}
        patients={patients}
        engineContext={engineContext}
      />

      <AlertDialog
        open={Boolean(ruleToDelete)}
        onOpenChange={(open) => !open && setRuleToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir regra?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a regra &quot;{ruleToDelete?.name}&quot;? Essa ação não
              pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleConfirmDelete}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={Boolean(runResult)} onOpenChange={(open) => !open && setRunResult(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Execução concluída</AlertDialogTitle>
            <AlertDialogDescription>
              {runResult && (
                <>
                  Regra &quot;{runResult.ruleName}&quot;: {runResult.sent} disparo(s) registrado(s)
                  {runResult.skippedNoEmail > 0 &&
                    `, ${runResult.skippedNoEmail} pulado(s) (sem e-mail cadastrado)`}
                  {runResult.skippedSendError > 0 &&
                    `, ${runResult.skippedSendError} pulado(s) (falha ao enviar o e-mail)`}
                  .
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setRunResult(null)}>Ok</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={Boolean(runError)} onOpenChange={(open) => !open && setRunError(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Não foi possível executar</AlertDialogTitle>
            <AlertDialogDescription>{runError?.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setRunError(null)}>Ok</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
