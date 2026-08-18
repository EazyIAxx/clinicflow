"use client";

import { Download, Upload } from "lucide-react";
import { useRef, useState, type ChangeEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { importExpensesCsv, type ExpenseCsvRow } from "@/lib/actions/financeiro";
import type { ExpenseStatus } from "@/lib/finance-status";
import { expenseCategories, type Expense } from "@/lib/financeiro-types";

type RowError = { row: number; message: string };

function parseCsv(text: string): string[][] {
  const clean = text.replace(/^﻿/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    if (inQuotes) {
      if (char === '"') {
        if (clean[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }
    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && clean[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((cells) => cells.some((cell) => cell.trim() !== ""));
}

function normalizeDate(value: string): string | null {
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const brMatch = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (brMatch) return `${brMatch[3]}-${brMatch[2]}-${brMatch[1]}`;
  return null;
}

function normalizeAmount(value: string): number {
  const cleaned = value.trim().replace(/[^\d,.-]/g, "");
  if (/,\d{2}$/.test(cleaned)) {
    return Number(cleaned.replace(/\./g, "").replace(",", "."));
  }
  return Number(cleaned.replace(/,/g, ""));
}

const categoryLookup = new Map(expenseCategories.map((category) => [category.toLowerCase(), category]));
const statusLookup: Record<string, ExpenseStatus> = { pendente: "pendente", pago: "pago" };

function parseRows(rawRows: string[][]): { rows: ExpenseCsvRow[]; errors: RowError[] } {
  const looksLikeHeader = rawRows[0]?.[0]?.toLowerCase().includes("descri");
  const body = looksLikeHeader ? rawRows.slice(1) : rawRows;
  const firstDataRowNumber = looksLikeHeader ? 2 : 1;

  const rows: ExpenseCsvRow[] = [];
  const errors: RowError[] = [];

  body.forEach((cells, index) => {
    const rowNumber = firstDataRowNumber + index;
    const [description = "", categoryRaw = "", amountRaw = "", dueDateRaw = "", statusRaw = ""] = cells;

    if (!description.trim()) {
      errors.push({ row: rowNumber, message: "Descrição vazia." });
      return;
    }
    const category = categoryLookup.get(categoryRaw.trim().toLowerCase());
    if (!category) {
      errors.push({ row: rowNumber, message: `Categoria inválida: "${categoryRaw}".` });
      return;
    }
    const amount = normalizeAmount(amountRaw);
    if (!Number.isFinite(amount) || amount <= 0) {
      errors.push({ row: rowNumber, message: `Valor inválido: "${amountRaw}".` });
      return;
    }
    const dueDate = normalizeDate(dueDateRaw);
    if (!dueDate) {
      errors.push({ row: rowNumber, message: `Data inválida: "${dueDateRaw}" (use dd/mm/aaaa).` });
      return;
    }
    const status = statusLookup[statusRaw.trim().toLowerCase()] ?? "pendente";

    rows.push({ description: description.trim(), category, amount, dueDate, status });
  });

  return { rows, errors };
}

const TEMPLATE_CSV =
  "Descrição,Categoria,Valor,Vencimento,Status\n" +
  "Material odontológico,Fornecedores,150.00,10/09/2026,Pendente\n" +
  "Aluguel,Aluguel,3200.00,05/09/2026,Pendente\n";

export function ImportExpensesDialog({
  open,
  onOpenChange,
  onImported,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported: (created: Expense[]) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ rows: ExpenseCsvRow[]; errors: RowError[] } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ created: Expense[]; errors: RowError[] } | null>(null);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setResult(null);
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      setPreview(parseRows(parseCsv(text)));
    };
    reader.readAsText(file, "utf-8");
  }

  function handleDownloadTemplate() {
    const blob = new Blob([`﻿${TEMPLATE_CSV}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "modelo-despesas.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport() {
    if (!preview || preview.rows.length === 0) return;
    setIsSubmitting(true);
    const response = await importExpensesCsv(preview.rows);
    setIsSubmitting(false);
    if (response.data) {
      setResult(response.data);
      if (response.data.created.length > 0) onImported(response.data.created);
    }
  }

  function handleClose(nextOpen: boolean) {
    if (!nextOpen) {
      setFileName(null);
      setPreview(null);
      setResult(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Importar despesas via CSV</DialogTitle>
          <DialogDescription>
            Colunas esperadas: Descrição, Categoria, Valor, Vencimento (dd/mm/aaaa), Status
            (opcional — assume &quot;Pendente&quot;).
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <Button variant="outline" size="sm" onClick={handleDownloadTemplate} className="self-start">
            <Download />
            Baixar modelo
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="text-sm"
          />

          {preview && (
            <div className="flex flex-col gap-2 rounded-md border p-3 text-sm">
              <p>
                <strong>{preview.rows.length}</strong> linha(s) válida(s)
                {preview.errors.length > 0 && `, ${preview.errors.length} com erro`}
                {fileName && ` em ${fileName}`}.
              </p>
              {preview.errors.length > 0 && (
                <ul className="text-destructive max-h-32 list-disc overflow-y-auto pl-5 text-xs">
                  {preview.errors.map((error) => (
                    <li key={error.row}>
                      Linha {error.row}: {error.message}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {result && (
            <p className="text-sm">
              {result.created.length} despesa(s) importada(s) com sucesso
              {result.errors.length > 0 && `, ${result.errors.length} pulada(s)`}.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button onClick={handleImport} disabled={!preview || preview.rows.length === 0 || isSubmitting}>
            <Upload />
            {isSubmitting ? "Importando..." : `Importar ${preview?.rows.length ?? 0} despesa(s)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
