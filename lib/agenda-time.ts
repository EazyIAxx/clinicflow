import { addDays, format, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";

export const DAY_START_HOUR = 8;
export const DAY_END_HOUR = 19;
export const SLOT_MINUTES = 30;

export function generateTimeSlots(): string[] {
  const slots: string[] = [];
  const totalMinutes = (DAY_END_HOUR - DAY_START_HOUR) * 60;
  for (let minutes = 0; minutes < totalMinutes; minutes += SLOT_MINUTES) {
    const hour = DAY_START_HOUR + Math.floor(minutes / 60);
    const minute = minutes % 60;
    slots.push(`${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
  }
  return slots;
}

export function timeToRowIndex(time: string): number {
  const [hour, minute] = time.split(":").map(Number);
  return Math.round(((hour - DAY_START_HOUR) * 60 + minute) / SLOT_MINUTES);
}

export function durationToRowSpan(durationMinutes: number): number {
  return Math.max(1, Math.round(durationMinutes / SLOT_MINUTES));
}

export function getWeekDates(referenceDate: Date): Date[] {
  const start = startOfWeek(referenceDate, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

export function formatDateKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function capitalize(text: string): string {
  return text.length === 0 ? text : text[0].toUpperCase() + text.slice(1);
}

export function formatWeekdayShort(date: Date): string {
  return capitalize(format(date, "EEE", { locale: ptBR }));
}

export function formatDayMonth(date: Date): string {
  return format(date, "dd/MM", { locale: ptBR });
}

export function formatFullDate(date: Date): string {
  return capitalize(format(date, "EEEE, d 'de' MMMM", { locale: ptBR }));
}
