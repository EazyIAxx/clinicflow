import {
  CalendarDays,
  ClipboardList,
  Package,
  Receipt,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react";

const features: { title: string; description: string; icon: LucideIcon }[] = [
  {
    title: "Agenda",
    description:
      "Calendário por profissional e sala, com confirmação e remarcação sem trocar mensagens soltas.",
    icon: CalendarDays,
  },
  {
    title: "Pacientes",
    description: "Cadastro completo e histórico centralizado — nada de fichas espalhadas.",
    icon: Users,
  },
  {
    title: "Prontuários",
    description: "Exames, receitas e documentos organizados por paciente, com acesso controlado.",
    icon: ClipboardList,
  },
  {
    title: "Estoque",
    description: "Alerta de estoque mínimo e validade — acaba a surpresa de faltar material.",
    icon: Package,
  },
  {
    title: "Orçamentos",
    description: "Tabela de procedimentos e geração de orçamento por paciente em poucos cliques.",
    icon: Receipt,
  },
  {
    title: "Automações WhatsApp",
    description:
      "Lembrete e confirmação de consulta automáticos pelo WhatsApp, sem depender da recepção.",
    icon: Workflow,
  },
];

export function FeaturesSection() {
  return (
    <section id="funcionalidades" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-heading text-3xl font-semibold tracking-tight text-balance">
          Tudo que sua clínica precisa, num só sistema
        </h2>
        <p className="text-muted-foreground mt-3 text-balance">
          Cada módulo resolve um gargalo real do dia a dia — sem depender de planilha, papel ou
          grupo de WhatsApp da equipe.
        </p>
      </div>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <div key={feature.title} className="bg-card flex flex-col gap-3 rounded-2xl border p-6">
            <span className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-xl">
              <feature.icon className="size-5" />
            </span>
            <p className="font-heading font-semibold">{feature.title}</p>
            <p className="text-muted-foreground text-sm">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
