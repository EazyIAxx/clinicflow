import Link from "next/link";

import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="bg-primary text-primary-foreground flex flex-col items-center gap-4 rounded-3xl px-6 py-14 text-center">
        <h2 className="font-heading text-3xl font-semibold tracking-tight text-balance">
          Pronto para organizar sua clínica?
        </h2>
        <p className="max-w-xl text-balance opacity-90">
          Centralize agenda, estoque, prontuários e atendimento pelo WhatsApp em um só lugar —
          comece agora.
        </p>
        <Button size="lg" variant="secondary" className="mt-2" render={<Link href="/register" />}>
          Começar agora
        </Button>
      </div>
    </section>
  );
}
