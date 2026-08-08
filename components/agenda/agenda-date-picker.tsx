"use client";

import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatFullDate } from "@/lib/agenda-time";
import { cn } from "@/lib/utils";

export function AgendaDatePicker({
  date,
  onDateChange,
  className,
}: {
  date: Date;
  onDateChange: (date: Date) => void;
  className?: string;
}) {
  return (
    <Popover>
      <PopoverTrigger
        render={<Button variant="outline" className={cn("justify-start font-normal", className)} />}
      >
        <CalendarIcon />
        <span className="truncate">{formatFullDate(date)}</span>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          locale={ptBR}
          selected={date}
          onSelect={(selected) => {
            if (selected) onDateChange(selected);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
