"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Selecionar data",
  className,
}: {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <Popover>
      <PopoverTrigger
        render={<Button variant="outline" className={cn("justify-start font-normal", className)} />}
      >
        <CalendarIcon />
        <span className="truncate">
          {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : placeholder}
        </span>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar mode="single" locale={ptBR} selected={date} onSelect={onDateChange} />
      </PopoverContent>
    </Popover>
  );
}
