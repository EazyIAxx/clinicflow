import { Check } from "lucide-react";

import { PhoneMockup } from "@/components/marketing/phone-mockup";

const bullets = [
  "Agenda sempre atualizada, em tempo real, pra toda a equipe",
  "Lembrete e confirmação de consulta automáticos pelo WhatsApp",
  "Relatórios prontos pra decisão, sem planilha manual",
  "Prontuário seguro, com acesso controlado por perfil",
];

export function ShowcaseSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="flex flex-col items-center gap-12 md:flex-row md:items-center">
        <div className="flex flex-1 flex-col gap-5 text-center md:text-left">
          <span className="bg-primary/10 text-primary self-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase md:self-start">
            No seu bolso
          </span>
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-balance">
            Sua clínica, na palma da mão
          </h2>
          <p className="text-muted-foreground text-balance">
            Acompanhe a agenda, dispare lembretes e veja os números da clínica de onde estiver — o
            ClinicFlow roda liso no computador da recepção e no celular do gestor.
          </p>
          <ul className="flex flex-col gap-2.5 self-center md:self-start">
            {bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-2 text-left text-sm">
                <span className="bg-primary/10 text-primary mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full">
                  <Check className="size-3" />
                </span>
                {bullet}
              </li>
            ))}
          </ul>
        </div>
        <div className="w-full flex-1">
          <PhoneMockup />
        </div>
      </div>
    </section>
  );
}
