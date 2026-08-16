"use client";

import { Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { CrmBoard } from "@/components/crm/crm-board";
import { LeadDetailSheet } from "@/components/crm/lead-detail-sheet";
import { LeadFormDialog } from "@/components/crm/lead-form-dialog";
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
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { deleteLead, updateLeadStage } from "@/lib/actions/crm";
import type { Professional } from "@/lib/agenda-types";
import { isLeadStale, type Interaction, type Lead } from "@/lib/crm-types";
import type { LeadStage } from "@/lib/lead-status";

export function CrmView({
  initialLeads,
  initialInteractions,
  professionals,
  referenceDate,
}: {
  initialLeads: Lead[];
  initialInteractions: Interaction[];
  professionals: Professional[];
  referenceDate: Date;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [interactions, setInteractions] = useState<Interaction[]>(initialInteractions);
  const [search, setSearch] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [editingLead, setEditingLead] = useState<Lead | undefined>(undefined);

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);

  const filteredLeads = leads.filter((lead) =>
    lead.name.toLowerCase().includes(search.toLowerCase()),
  );
  const selectedLead = leads.find((lead) => lead.id === selectedLeadId) ?? null;

  const totalLeads = leads.length;
  const convertedCount = leads.filter((lead) => lead.stage === "convertido").length;
  const conversionRate = totalLeads > 0 ? Math.round((convertedCount / totalLeads) * 100) : 0;
  const staleCount = leads.filter((lead) => isLeadStale(lead, interactions, referenceDate)).length;

  function openNewLeadDialog() {
    setEditingLead(undefined);
    setFormKey((key) => key + 1);
    setIsFormOpen(true);
  }

  function openEditLeadDialog(lead: Lead) {
    setEditingLead(lead);
    setFormKey((key) => key + 1);
    setIsFormOpen(true);
  }

  function handleFormSubmit(lead: Lead) {
    setLeads((prev) => {
      const exists = prev.some((existing) => existing.id === lead.id);
      return exists
        ? prev.map((existing) => (existing.id === lead.id ? lead : existing))
        : [...prev, lead];
    });
    router.refresh();
  }

  function handleStageChange(leadId: string, stage: LeadStage) {
    setLeads((prev) => prev.map((lead) => (lead.id === leadId ? { ...lead, stage } : lead)));
    startTransition(async () => {
      await updateLeadStage(leadId, stage);
      router.refresh();
    });
  }

  function openLeadDetail(lead: Lead) {
    setSelectedLeadId(lead.id);
    setIsSheetOpen(true);
  }

  function handleEditFromSheet(lead: Lead) {
    setIsSheetOpen(false);
    openEditLeadDialog(lead);
  }

  function handleDeleteFromSheet(lead: Lead) {
    setIsSheetOpen(false);
    setLeadToDelete(lead);
  }

  function handleConfirmDelete() {
    if (!leadToDelete) return;
    const id = leadToDelete.id;
    startTransition(async () => {
      await deleteLead(id);
      setLeads((prev) => prev.filter((existing) => existing.id !== id));
      router.refresh();
    });
    setLeadToDelete(null);
  }

  function handleAddInteraction(interaction: Interaction) {
    setInteractions((prev) => [...prev, interaction]);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Leads no funil</CardDescription>
            <CardTitle className="text-2xl">{totalLeads}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Taxa de conversão</CardDescription>
            <CardTitle className="text-2xl">{conversionRate}%</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Sem retorno há 3+ dias</CardDescription>
            <CardTitle className="text-2xl">{staleCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button onClick={openNewLeadDialog}>
          <Plus />
          Novo lead
        </Button>
        <div className="relative w-full sm:w-auto">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar lead..."
            className="w-full pl-8 sm:w-56"
          />
        </div>
      </div>

      <CrmBoard
        leads={filteredLeads}
        interactions={interactions}
        referenceDate={referenceDate}
        onCardClick={openLeadDetail}
        onStageChange={handleStageChange}
      />

      <LeadFormDialog
        key={`lead-form-${formKey}`}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        lead={editingLead}
        professionals={professionals}
        onSubmit={handleFormSubmit}
      />

      <LeadDetailSheet
        lead={selectedLead}
        interactions={interactions}
        professionals={professionals}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onStageChange={handleStageChange}
        onEdit={handleEditFromSheet}
        onDelete={handleDeleteFromSheet}
        onAddInteraction={handleAddInteraction}
      />

      <AlertDialog
        open={Boolean(leadToDelete)}
        onOpenChange={(open) => !open && setLeadToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir lead?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir &quot;{leadToDelete?.name}&quot;? Essa ação não pode
              ser desfeita.
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
