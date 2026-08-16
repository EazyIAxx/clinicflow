import { Check } from "lucide-react";
import Link from "next/link";

import { BrowserMockup } from "@/components/marketing/browser-mockup";
import { Button } from "@/components/ui/button";

const trustBadges = [
  "Suporte especializado",
  "Migração de dados facilitada",
  "Atualizações constantes",
];

export function HeroSection() {
  return (
    <section className="mx-auto flex max-w-5xl flex-col items-center gap-8 px-6 pt-16 pb-20 text-center md:pt-24">
      <h1 className="font-heading text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl">
        Tudo o que sua clínica precisa para <span className="text-primary">crescer.</span>
      </h1>
      <p className="text-muted-foreground max-w-2xl text-lg text-balance">
        Um único sistema que cuida da agenda, do estoque, dos prontuários e do atendimento via
        WhatsApp da sua clínica — pra sua equipe focar no que importa: os pacientes.
      </p>
      <div className="flex flex-col justify-center gap-3 sm:flex-row">
        <Button size="lg" render={<Link href="/register" />}>
          Começar agora
        </Button>
        <Button size="lg" variant="outline" render={<a href="#funcionalidades" />}>
          Ver funcionalidades
        </Button>
      </div>
      <ul className="text-muted-foreground flex flex-col flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm sm:flex-row">
        {trustBadges.map((badge) => (
          <li key={badge} className="flex items-center gap-1.5">
            <Check className="text-primary size-4 shrink-0" />
            {badge}
          </li>
        ))}
      </ul>
      <div className="w-full pt-8">
        <BrowserMockup />
      </div>
    </section>
  );
}
