"use client";

import { useState } from "react";

import { AutomationFormDialog } from "@/components/automacoes/automation-form-dialog";
import { AutomationTemplates } from "@/components/automacoes/automation-templates";
import { AutomationsTable } from "@/components/automacoes/automations-table";
import { AutomationsToolbar } from "@/components/automacoes/automations-toolbar";
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
import type { AutomationStatus } from "@/lib/automacao-status";
import type { AutomationRule, AutomationTemplate } from "@/lib/mock-automacoes";
import type { Patient } from "@/lib/mock-pacientes";

export function AutomacoesView({
  initialRules,
  patients,
}: {
  initialRules: AutomationRule[];
  patients: Patient[];
}) {
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
  }

  function handleToggleStatus(rule: AutomationRule) {
    setRules((prev) =>
      prev.map((existing) =>
        existing.id === rule.id
          ? { ...existing, status: existing.status === "ativa" ? "pausada" : "ativa" }
          : existing,
      ),
    );
  }

  function handleConfirmDelete() {
    if (!ruleToDelete) return;
    setRules((prev) => prev.filter((existing) => existing.id !== ruleToDelete.id));
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
      />

      <AutomationsTable
        rules={filteredRules}
        onEdit={openEditRuleDialog}
        onToggleStatus={handleToggleStatus}
        onDelete={setRuleToDelete}
      />

      <AutomationFormDialog
        key={`automation-form-${formKey}`}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        rule={editingRule}
        prefill={prefill}
        patients={patients}
        onSubmit={handleRuleSubmit}
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
    </div>
  );
}
