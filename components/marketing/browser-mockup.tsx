"use client";

import { CalendarCheck, Lock, ShieldCheck } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

const days = [
  { label: "SEG", date: 20 },
  { label: "TER", date: 21 },
  { label: "QUA", date: 22 },
  { label: "QUI", date: 23 },
  { label: "SEX", date: 24 },
];

const appointments = [
  { day: 0, offset: 0, name: "Larissa F.", time: "09:00", color: "bg-chart-2" },
  { day: 1, offset: 1, name: "Eduardo M.", time: "10:30", color: "bg-chart-1" },
  { day: 1, offset: 0, name: "Camila D.", time: "08:30", color: "bg-chart-4" },
  { day: 2, offset: 0, name: "Patrícia G.", time: "08:00", color: "bg-chart-4" },
  { day: 3, offset: 2, name: "Gabriel A.", time: "14:00", color: "bg-chart-3" },
  { day: 4, offset: 0, name: "Sabrina M.", time: "09:30", color: "bg-chart-5" },
];

const floatingStats = [
  {
    icon: CalendarCheck,
    label: "-32% faltas em consulta",
    className: "-top-5 -left-6 sm:-left-12",
  },
  {
    icon: ShieldCheck,
    label: "100% prontuários seguros",
    className: "-right-4 -bottom-5 sm:-right-10",
  },
];

export function BrowserMockup() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="relative mx-auto w-full max-w-4xl">
      <motion.div
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-card overflow-hidden rounded-2xl border shadow-2xl"
      >
        <div className="bg-muted/40 flex items-center gap-3 border-b px-4 py-2.5">
          <div className="flex gap-1.5">
            <span className="bg-muted-foreground/20 size-2.5 rounded-full" />
            <span className="bg-muted-foreground/20 size-2.5 rounded-full" />
            <span className="bg-muted-foreground/20 size-2.5 rounded-full" />
          </div>
          <div className="bg-background text-muted-foreground mx-auto flex items-center gap-1.5 rounded-full border px-4 py-1 text-xs">
            <Lock className="size-3" />
            app.clinicflow.com.br/agenda
          </div>
        </div>

        <div className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-heading text-sm font-semibold">Agenda</span>
              <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[0.65rem] font-medium">
                Esta semana
              </span>
            </div>
            <span className="bg-primary text-primary-foreground rounded-lg px-3 py-1.5 text-xs font-medium">
              + Nova consulta
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {days.map((day, dayIndex) => (
              <div key={day.label} className="flex flex-col gap-2">
                <p className="text-muted-foreground text-center text-[0.65rem] font-medium">
                  {day.label} <span className="text-foreground font-semibold">{day.date}</span>
                </p>
                <div className="bg-muted/30 flex h-40 flex-col gap-1.5 rounded-lg p-1.5">
                  {appointments
                    .filter((appointment) => appointment.day === dayIndex)
                    .map((appointment) => (
                      <div
                        key={appointment.name}
                        style={{ marginTop: appointment.offset * 20 }}
                        className={`${appointment.color} rounded-md px-1.5 py-1 text-[0.6rem] font-medium text-white`}
                      >
                        {appointment.time} {appointment.name}
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {!prefersReducedMotion &&
        floatingStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0.3 + index * 0.2 }}
            className={`bg-card absolute z-20 hidden items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium shadow-lg sm:flex ${stat.className}`}
          >
            <stat.icon className="text-primary size-4 shrink-0" />
            {stat.label}
          </motion.div>
        ))}
    </div>
  );
}
