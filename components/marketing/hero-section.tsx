import { Check } from "lucide-react";
import Link from "next/link";

import { PhoneMockup } from "@/components/marketing/phone-mockup";
import { Button } from "@/components/ui/button";

const bullets = [
  "Agenda, estoque e prontuário num só lugar",
  "Lembretes e confirmações automáticas pelo WhatsApp",
  "Controle de acesso por perfil da equipe",
];

export function HeroSection() {
  return (
    <section className="mx-auto flex max-w-6xl flex-col items-center gap-12 px-6 pt-16 pb-20 md:flex-row md:pt-24 md:pb-28">
      <div className="flex flex-1 flex-col gap-6 text-center md:text-left">
        <h1 className="font-heading text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl">
          Sua clínica organizada, do agendamento ao financeiro
        </h1>
        <p className="text-muted-foreground text-lg text-balance">
          O ClinicFlow centraliza agenda, estoque, prontuários e atendimento via WhatsApp — pra sua
          equipe parar de perder tempo com planilhas e recados soltos.
        </p>
        <ul className="flex flex-col gap-2 self-center md:self-start">
          {bullets.map((bullet) => (
            <li key={bullet} className="flex items-center gap-2 text-sm">
              <span className="bg-primary/10 text-primary flex size-5 shrink-0 items-center justify-center rounded-full">
                <Check className="size-3" />
              </span>
              {bullet}
            </li>
          ))}
        </ul>
        <div className="flex flex-col justify-center gap-3 pt-2 sm:flex-row md:justify-start">
          <Button size="lg" render={<Link href="/register" />}>
            Começar agora
          </Button>
          <Button size="lg" variant="outline" render={<a href="#funcionalidades" />}>
            Ver funcionalidades
          </Button>
        </div>
      </div>
      <div className="w-full flex-1">
        <PhoneMockup />
      </div>
    </section>
  );
}
