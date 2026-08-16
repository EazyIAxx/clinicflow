"use client";

import { motion } from "motion/react";

const results: { stat: string; description: string }[] = [
  { stat: "-32%", description: "faltas em consulta com lembrete automático pelo WhatsApp" },
  { stat: "3h/semana", description: "a menos em agenda e confirmações manuais por profissional" },
  { stat: "100%", description: "dos prontuários organizados e com acesso controlado por perfil" },
  { stat: "-45%", description: "no tempo perdido com material em falta na hora do atendimento" },
];

export function ResultsSection() {
  return (
    <section id="resultados" className="scroll-mt-20 border-y">
      <div className="bg-muted/40 mx-auto max-w-6xl px-6 py-20">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase">
            Resultados
          </span>
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-balance">
            Tecnologia que transforma a gestão
          </h2>
          <p className="text-muted-foreground text-balance">
            Estimativas com base no ganho típico de clínicas que centralizam agenda, estoque e
            atendimento em um só sistema — o quanto sua clínica ganha depende da rotina de hoje.
          </p>
        </div>

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {results.map((result, index) => (
            <motion.div
              key={result.stat + result.description}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col gap-2 text-center sm:text-left"
            >
              <p className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
                {result.stat}
              </p>
              <p className="text-muted-foreground text-sm">{result.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
