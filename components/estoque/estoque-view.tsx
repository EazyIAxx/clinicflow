"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { EstoqueTable } from "@/components/estoque/estoque-table";
import { EstoqueToolbar } from "@/components/estoque/estoque-toolbar";
import { ItemFormDialog } from "@/components/estoque/item-form-dialog";
import { MovementsTable } from "@/components/estoque/movements-table";
import { StockMovementDialog } from "@/components/estoque/stock-movement-dialog";
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
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { deleteItem } from "@/lib/actions/estoque";
import type {
  StockCategory,
  StockItem,
  StockItemMovementResult,
  StockMovement,
} from "@/lib/estoque-types";
import { getStockFlags } from "@/lib/stock-status";

export function EstoqueView({
  initialItems,
  initialMovements,
  referenceDate,
  canManage,
}: {
  initialItems: StockItem[];
  initialMovements: StockMovement[];
  referenceDate: Date;
  canManage: boolean;
}) {
  const router = useRouter();
  const [isDeleting, startDeleteTransition] = useTransition();

  const [items, setItems] = useState<StockItem[]>(initialItems);
  const [movements, setMovements] = useState<StockMovement[]>(initialMovements);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<StockCategory | "todas">("todas");

  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [itemDialogKey, setItemDialogKey] = useState(0);
  const [editingItem, setEditingItem] = useState<StockItem | undefined>(undefined);

  const [isMovementDialogOpen, setIsMovementDialogOpen] = useState(false);
  const [movementDialogKey, setMovementDialogKey] = useState(0);
  const [movementItem, setMovementItem] = useState<StockItem | null>(null);

  const [itemToDelete, setItemToDelete] = useState<StockItem | null>(null);

  const itemsById = useMemo(
    () => Object.fromEntries(items.map((item) => [item.id, item])),
    [items],
  );

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "todas" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const sortedMovements = [...movements].sort((a, b) =>
    a.date < b.date ? 1 : a.date > b.date ? -1 : 0,
  );

  const lowStockCount = items.filter((item) =>
    getStockFlags({
      quantity: item.quantity,
      minQuantity: item.minQuantity,
      expiresAt: item.expiresAt,
      referenceDate,
    }).includes("baixo"),
  ).length;

  const expiringCount = items.filter((item) => {
    const flags = getStockFlags({
      quantity: item.quantity,
      minQuantity: item.minQuantity,
      expiresAt: item.expiresAt,
      referenceDate,
    });
    return flags.includes("vencendo") || flags.includes("vencido");
  }).length;

  function openNewItemDialog() {
    setEditingItem(undefined);
    setItemDialogKey((key) => key + 1);
    setIsItemDialogOpen(true);
  }

  function openEditItemDialog(item: StockItem) {
    setEditingItem(item);
    setItemDialogKey((key) => key + 1);
    setIsItemDialogOpen(true);
  }

  function handleItemSubmit(item: StockItem) {
    setItems((prev) => {
      const exists = prev.some((existing) => existing.id === item.id);
      return exists
        ? prev.map((existing) => (existing.id === item.id ? item : existing))
        : [...prev, item];
    });
    router.refresh();
  }

  function openMovementDialog(item: StockItem) {
    setMovementItem(item);
    setMovementDialogKey((key) => key + 1);
    setIsMovementDialogOpen(true);
  }

  function handleConfirmDelete() {
    if (!itemToDelete) return;
    const id = itemToDelete.id;
    startDeleteTransition(async () => {
      await deleteItem(id);
      setItems((prev) => prev.filter((existing) => existing.id !== id));
      router.refresh();
    });
    setItemToDelete(null);
  }

  function handleMovementSubmit(result: StockItemMovementResult) {
    setMovements((prev) => [...prev, result.movement]);
    setItems((prev) => prev.map((item) => (item.id === result.item.id ? result.item : item)));
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Itens cadastrados</CardDescription>
            <CardTitle className="text-2xl">{items.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Abaixo do mínimo</CardDescription>
            <CardTitle className="text-2xl">{lowStockCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Vencendo ou vencidos</CardDescription>
            <CardTitle className="text-2xl">{expiringCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="itens">
        <TabsList>
          <TabsTrigger value="itens">Itens</TabsTrigger>
          <TabsTrigger value="movimentacoes">Movimentações</TabsTrigger>
        </TabsList>

        <TabsContent value="itens" className="mt-4 flex flex-col gap-4">
          <EstoqueToolbar
            search={search}
            onSearchChange={setSearch}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={setCategoryFilter}
            onNewItem={openNewItemDialog}
            canManage={canManage}
          />
          <EstoqueTable
            items={filteredItems}
            referenceDate={referenceDate}
            onEdit={openEditItemDialog}
            onRegisterMovement={openMovementDialog}
            onDelete={setItemToDelete}
            canManage={canManage}
          />
        </TabsContent>

        <TabsContent value="movimentacoes" className="mt-4">
          <MovementsTable movements={sortedMovements} itemsById={itemsById} />
        </TabsContent>
      </Tabs>

      {canManage && (
        <>
          <ItemFormDialog
            key={`item-form-${itemDialogKey}`}
            open={isItemDialogOpen}
            onOpenChange={setIsItemDialogOpen}
            item={editingItem}
            onSubmit={handleItemSubmit}
          />

          <StockMovementDialog
            key={`stock-movement-${movementDialogKey}`}
            open={isMovementDialogOpen}
            onOpenChange={setIsMovementDialogOpen}
            item={movementItem}
            onSubmit={handleMovementSubmit}
          />

          <AlertDialog
            open={Boolean(itemToDelete)}
            onOpenChange={(open) => !open && setItemToDelete(null)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remover item?</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja remover &quot;{itemToDelete?.name}&quot; do estoque? Essa
                  ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                >
                  Remover
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
}
