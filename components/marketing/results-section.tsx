"use client";

import { Clock3, FolderCheck, PackageCheck, TrendingDown } from "lucide-react";
import { motion } from "motion/react";
import type { LucideIcon } from "lucide-react";

const results: { icon: LucideIcon; stat: string; description: string }[] = [
  {
    icon: TrendingDown,
    stat: "-32%",
    description: "faltas em consulta com lembrete automático pelo WhatsApp",
  },
  {
    icon: Clock3,
    stat: "3h/semana",
    description: "a menos em agenda e confirmações manuais por profissional",
  },
  {
    icon: FolderCheck,
    stat: "100%",
    description: "dos prontuários organizados e com acesso controlado por perfil",
  },
  {
    icon: PackageCheck,
    stat: "-45%",
    description: "no tempo perdido com material em falta na hora do atendimento",
  },
];

export function ResultsSection() {
  return (
    <section id="resultados" className="scroll-mt-20 border-y">
      <div className="bg-muted/40 mx-auto max-w-6xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-balance">
            O que uma clínica organizada alcança
          </h2>
          <p className="text-muted-foreground mt-3 text-balance">
            Estimativas com base no ganho típico de clínicas que centralizam agenda, estoque e
            atendimento em um só sistema — o quanto sua clínica ganha depende da rotina de hoje.
          </p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {results.map((result, index) => (
            <motion.div
              key={result.stat + result.description}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card flex flex-col gap-2 rounded-2xl border p-6"
            >
              <result.icon className="text-primary size-6" />
              <p className="font-heading text-2xl font-semibold">{result.stat}</p>
              <p className="text-muted-foreground text-sm">{result.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
