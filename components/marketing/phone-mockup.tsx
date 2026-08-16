"use client";

import {
  CalendarCheck,
  FileText,
  Lock,
  MessageCircle,
  ShieldCheck,
  Signal,
  Wifi,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

const agendaRows = [
  { time: "09:00", name: "Larissa Fernandes", status: "Confirmada" },
  { time: "10:30", name: "Eduardo Martins", status: "Confirmada" },
  { time: "14:00", name: "Patrícia Gomes", status: "Aguardando" },
];

const chartBars = [38, 62, 45, 80, 58, 92, 70];

const documentRows = [
  { name: "Exame de sangue.pdf", icon: FileText },
  { name: "Receita - retorno.pdf", icon: FileText },
  { name: "Raio-X panorâmico.pdf", icon: FileText },
];

function ScreenHeader({ title }: { title: string }) {
  return <p className="font-heading text-sm font-semibold">{title}</p>;
}

function AgendaScreen() {
  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <ScreenHeader title="Agenda de hoje" />
      <div className="flex flex-col gap-2">
        {agendaRows.map((row) => (
          <div
            key={row.time}
            className="bg-card flex items-center gap-2 rounded-xl border p-2.5 text-xs"
          >
            <span className="text-muted-foreground w-10 shrink-0 font-medium">{row.time}</span>
            <span className="flex-1 truncate font-medium">{row.name}</span>
            <span
              className={`size-2 shrink-0 rounded-full ${
                row.status === "Confirmada" ? "bg-primary" : "bg-chart-4"
              }`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function WhatsAppScreen() {
  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <ScreenHeader title="Automações" />
      <div className="bg-card flex flex-col gap-2 rounded-xl border p-3">
        <div className="flex items-center gap-2">
          <span className="bg-primary text-primary-foreground flex size-6 shrink-0 items-center justify-center rounded-full">
            <MessageCircle className="size-3.5" />
          </span>
          <span className="text-xs font-semibold">Lembrete automático</span>
        </div>
        <p className="bg-muted text-muted-foreground rounded-lg p-2 text-[0.7rem] leading-relaxed">
          Olá Larissa! Lembrando da sua consulta amanhã às 09:00. Confirma pra gente? ✅
        </p>
        <span className="text-muted-foreground self-end text-[0.65rem]">Enviado ✓✓</span>
      </div>
    </div>
  );
}

function RelatoriosScreen() {
  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <ScreenHeader title="Relatórios" />
      <div className="bg-card flex flex-1 flex-col justify-between rounded-xl border p-3">
        <div className="flex h-20 items-end gap-1.5">
          {chartBars.map((height, index) => (
            <motion.div
              key={index}
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ duration: 0.6, delay: index * 0.06, ease: "easeOut" }}
              className="bg-primary/70 flex-1 rounded-t-sm"
            />
          ))}
        </div>
        <div>
          <p className="text-lg font-semibold">+18%</p>
          <p className="text-muted-foreground text-[0.65rem]">consultas concluídas no mês</p>
        </div>
      </div>
    </div>
  );
}

function ProntuarioScreen() {
  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <ScreenHeader title="Prontuário — Larissa F." />
      <div className="flex flex-col gap-2">
        {documentRows.map((doc) => (
          <div
            key={doc.name}
            className="bg-card flex items-center gap-2 rounded-xl border p-2.5 text-xs"
          >
            <doc.icon className="text-accent-foreground size-4 shrink-0" />
            <span className="flex-1 truncate">{doc.name}</span>
          </div>
        ))}
      </div>
      <div className="text-muted-foreground mt-auto flex items-center gap-1.5 text-[0.65rem]">
        <Lock className="size-3" />
        Acesso controlado por perfil
      </div>
    </div>
  );
}

const screens = [
  { key: "agenda", Component: AgendaScreen },
  { key: "whatsapp", Component: WhatsAppScreen },
  { key: "relatorios", Component: RelatoriosScreen },
  { key: "prontuario", Component: ProntuarioScreen },
];

const floatingStats = [
  {
    icon: CalendarCheck,
    label: "-32% faltas em consulta",
    className: "-top-4 -left-6 sm:-left-14",
  },
  {
    icon: ShieldCheck,
    label: "100% prontuários seguros",
    className: "-right-4 -bottom-4 sm:-right-12",
  },
];

export function PhoneMockup() {
  const [screenIndex, setScreenIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;
    const interval = setInterval(() => {
      setScreenIndex((index) => (index + 1) % screens.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

  const ActiveScreen = screens[screenIndex].Component;

  return (
    <div className="relative mx-auto w-full max-w-[280px]">
      <div className="relative aspect-[9/19] w-full rounded-[2.5rem] border-[10px] border-neutral-800 bg-neutral-900 shadow-2xl">
        <div className="absolute top-0 left-1/2 z-10 h-5 w-24 -translate-x-1/2 rounded-b-2xl bg-neutral-900" />
        <div className="bg-background absolute inset-0 flex flex-col overflow-hidden rounded-[1.75rem]">
          <div className="text-foreground flex items-center justify-between px-5 pt-3 pb-1 text-[0.65rem] font-medium">
            <span>09:41</span>
            <span className="flex items-center gap-1">
              <Signal className="size-3" />
              <Wifi className="size-3" />
            </span>
          </div>
          <div className="relative flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={screens[screenIndex].key}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                <ActiveScreen />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {!prefersReducedMotion &&
        floatingStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 + index * 0.25 }}
            className={`bg-card absolute z-20 hidden items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium shadow-lg sm:flex ${stat.className}`}
          >
            <stat.icon className="text-primary size-4 shrink-0" />
            {stat.label}
          </motion.div>
        ))}
    </div>
  );
}
