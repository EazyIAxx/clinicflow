import {
  CalendarDays,
  ClipboardList,
  Handshake,
  LineChart,
  Package,
  Receipt,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react";

const features: { title: string; description: string; icon: LucideIcon; accent: string }[] = [
  {
    title: "Agenda inteligente",
    description: "Calendário por profissional e sala, com confirmação e remarcação sem conflito.",
    icon: CalendarDays,
    accent: "bg-primary",
  },
  {
    title: "Automações WhatsApp",
    description: "Lembrete e confirmação de consulta automáticos, sem depender da recepção.",
    icon: Workflow,
    accent: "bg-chart-1",
  },
  {
    title: "Pacientes",
    description: "Cadastro completo e histórico centralizado — nada de fichas espalhadas.",
    icon: Users,
    accent: "bg-chart-3",
  },
  {
    title: "Prontuários",
    description: "Exames, receitas e documentos organizados por paciente, com acesso controlado.",
    icon: ClipboardList,
    accent: "bg-chart-4",
  },
  {
    title: "Estoque",
    description: "Alerta de estoque mínimo e validade — acaba a surpresa de faltar material.",
    icon: Package,
    accent: "bg-primary",
  },
  {
    title: "Orçamentos",
    description: "Tabela de procedimentos e geração de orçamento por paciente em poucos cliques.",
    icon: Receipt,
    accent: "bg-chart-1",
  },
  {
    title: "CRM",
    description: "Funil de leads e indicações até a conversão em paciente, sempre atualizado.",
    icon: Handshake,
    accent: "bg-chart-3",
  },
  {
    title: "Relatórios",
    description: "Indicadores de gestão pra decisão baseada em dado, não em achismo.",
    icon: LineChart,
    accent: "bg-chart-4",
  },
];

export function FeaturesSection() {
  return (
    <section id="funcionalidades" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
        <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase">
          Recursos
        </span>
        <h2 className="font-heading text-3xl font-semibold tracking-tight text-balance">
          Chega de processos manuais
        </h2>
        <p className="text-muted-foreground text-balance">
          Tudo que sua clínica precisa pra rodar sem depender de planilha, papel ou grupo de
          WhatsApp da equipe — automatizado, num único lugar.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature, index) => (
          <div
            key={feature.title}
            className="bg-card relative flex flex-col gap-3 overflow-hidden rounded-2xl border p-6"
          >
            <span className="text-muted-foreground/10 font-heading pointer-events-none absolute top-2 right-3 text-5xl font-bold select-none">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="bg-primary/10 text-primary relative flex size-10 items-center justify-center rounded-xl">
              <feature.icon className="size-5" />
            </span>
            <p className="font-heading relative font-semibold">{feature.title}</p>
            <p className="text-muted-foreground relative text-sm">{feature.description}</p>
            <span className={`h-0.5 w-8 rounded-full ${feature.accent}`} />
          </div>
        ))}
      </div>
    </section>
  );
}
