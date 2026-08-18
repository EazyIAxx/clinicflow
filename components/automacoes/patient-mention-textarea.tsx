"use client";

import { format } from "date-fns";
import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";

import { Textarea } from "@/components/ui/textarea";
import type { Patient } from "@/lib/patient-types";
import { cn } from "@/lib/utils";

const MAX_SUGGESTIONS = 6;

function findMention(text: string, caret: number) {
  const before = text.slice(0, caret);
  const start = before.lastIndexOf("{{");
  if (start === -1) return null;

  const query = before.slice(start + 2);
  if (/[\s{}]/.test(query)) return null;

  return { start, query };
}

export function PatientMentionTextarea({
  id,
  value,
  onChange,
  patients,
  placeholder,
  rows,
  required,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  patients: Patient[];
  placeholder?: string;
  rows?: number;
  required?: boolean;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pendingCaretRef = useRef<number | null>(null);

  const [mention, setMention] = useState<{ start: number; query: string } | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [dropdownRect, setDropdownRect] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const suggestions = mention
    ? patients
        .filter((patient) => patient.name.toLowerCase().includes(mention.query.toLowerCase()))
        .slice(0, MAX_SUGGESTIONS)
    : [];

  useEffect(() => {
    if (pendingCaretRef.current === null) return;
    const caret = pendingCaretRef.current;
    textareaRef.current?.setSelectionRange(caret, caret);
    pendingCaretRef.current = null;
  }, [value]);

  // O dropdown fica dentro do form com overflow-y-auto do dialog, então uma
  // posição absolute normal seria cortada — por isso portal + fixed, com a
  // posição recalculada a cada scroll do container.
  useEffect(() => {
    if (!mention || !textareaRef.current) {
      setDropdownRect(null);
      return;
    }

    function updateRect() {
      if (!textareaRef.current) return;
      const rect = textareaRef.current.getBoundingClientRect();
      setDropdownRect({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }

    updateRect();
    window.addEventListener("scroll", updateRect, true);
    window.addEventListener("resize", updateRect);
    return () => {
      window.removeEventListener("scroll", updateRect, true);
      window.removeEventListener("resize", updateRect);
    };
  }, [mention]);

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    const newValue = event.target.value;
    const caret = event.target.selectionStart;
    onChange(newValue);
    const nextMention = findMention(newValue, caret);
    setMention(nextMention);
    setHighlightedIndex(0);
  }

  function selectPatient(patient: Patient) {
    if (!mention || !textareaRef.current) return;
    const caret = textareaRef.current.selectionStart;
    const newValue = `${value.slice(0, mention.start)}${patient.name} ${value.slice(caret)}`;
    const newCaret = mention.start + patient.name.length + 1;
    pendingCaretRef.current = newCaret;
    onChange(newValue);
    setMention(null);
    textareaRef.current.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (!mention || suggestions.length === 0) return;

    if (event.key === "Escape") {
      event.stopPropagation();
      setMention(null);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((index) => (index + 1) % suggestions.length);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((index) => (index - 1 + suggestions.length) % suggestions.length);
      return;
    }
    if (event.key === "Enter" || event.key === "Tab") {
      event.preventDefault();
      selectPatient(suggestions[highlightedIndex]);
    }
  }

  return (
    <>
      <Textarea
        ref={textareaRef}
        id={id}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={() => setMention(null)}
        placeholder={placeholder}
        rows={rows}
        required={required}
      />
      {mention &&
        dropdownRect &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            style={{ top: dropdownRect.top, left: dropdownRect.left, width: dropdownRect.width }}
            className="bg-popover text-popover-foreground ring-foreground/10 fixed z-50 max-w-full overflow-hidden rounded-lg py-1 text-sm shadow-md ring-1"
          >
            {suggestions.length === 0 ? (
              <p className="text-muted-foreground px-3 py-2 text-xs">Nenhum paciente encontrado.</p>
            ) : (
              suggestions.map((patient, index) => (
                <button
                  key={patient.id}
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    selectPatient(patient);
                  }}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left",
                    index === highlightedIndex ? "bg-muted" : "hover:bg-muted",
                  )}
                >
                  <span className="truncate">{patient.name}</span>
                  <span className="text-muted-foreground shrink-0 text-xs">
                    {format(new Date(`${patient.birthDate}T00:00:00`), "dd/MM")}
                  </span>
                </button>
              ))
            )}
          </div>,
          document.body,
        )}
    </>
  );
}
