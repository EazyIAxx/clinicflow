@AGENTS.md

# CLAUDE.md — ClinicFlow

> Este arquivo é o briefing de referência para trabalhar neste projeto. PRD completo em [docs/PRD.md](docs/PRD.md) e roadmap de execução em [docs/PLAN.md](docs/PLAN.md).

## Sobre o projeto

ClinicFlow é um sistema de gestão para clínicas que centraliza agendamento de consultas/procedimentos, controle de estoque de materiais e medicamentos, e armazenamento seguro de arquivos/prontuários de pacientes. Na etapa final, integra com o WhatsApp (API oficial do Meta) através de um agente de IA que atende, agenda e envia lembretes automaticamente, escalando para um humano quando necessário.

## Stack técnica

- **Frontend**: Next.js (App Router) + React + TypeScript
- **UI**: Tailwind CSS + shadcn/ui
- **Backend/DB**: Supabase (Postgres, Auth, Storage) + Prisma como ORM
- **Runtime**: Node.js
- **E-mail transacional**: Resend — e-mails de autenticação (confirmação de cadastro, redefinição de senha, convite de usuário) e notificações/lembretes de consulta por e-mail
- **Canal de atendimento**: WhatsApp Business Platform (API oficial do Meta) para envio/recebimento de mensagens
- **Agente de IA**: Claude API, responsável pelo atendimento automatizado no WhatsApp (última etapa do projeto)

## Estrutura de pastas (proposta)

```
app/
  (auth)/              # login, registro
  (dashboard)/         # área autenticada
    agenda/
    estoque/
    pacientes/
    prontuarios/
    relatorios/
    configuracoes/
    crm/
    orcamentos/
    financeiro/
    automacoes/
    dashboard/
  api/                 # API routes (webhook do WhatsApp, etc.)
components/
  ui/                  # componentes shadcn/ui
  shared/              # componentes reutilizáveis entre módulos
lib/
  supabase/            # clients e helpers do Supabase
  email/               # cliente Resend e templates de e-mail transacional
  whatsapp/            # integração com WhatsApp Business API
  ai-agent/            # agente de IA (Claude API)
  utils/
prisma/
  schema.prisma
  migrations/
docs/
  PRD.md
```

## Convenções de código

- TypeScript estrito em todo o projeto.
- Server Components por padrão; Client Components apenas onde há interatividade real.
- Server Actions para mutações (criação/edição de agendamentos, estoque, uploads).
- Validação com Zod nas fronteiras do sistema: formulários, webhooks do WhatsApp, API routes.
- Nomes de arquivo em kebab-case; componentes React em PascalCase.
- Controle de acesso por perfil (recepcionista, profissional de saúde, gestor/admin) deve ser reforçado via RLS no Supabase, não só escondido na UI — dado sensível de paciente exige checagem no banco.

## Personas (para quem cada tela é feita)

| Persona                  | Necessidade principal                                                          |
| ------------------------ | ------------------------------------------------------------------------------ |
| Recepcionista/Secretária | Gerenciar agenda, cadastrar pacientes, confirmar consultas                     |
| Profissional de saúde    | Acessar própria agenda, prontuários e arquivos dos pacientes atendidos         |
| Gestor/Admin             | Configurar clínica, gerenciar estoque, usuários, permissões e relatórios       |
| Paciente                 | Interage só via WhatsApp com o agente de IA (agendar, remarcar, tirar dúvidas) |

## Linguagem visual

- **Doctoralia / iClinic** → referência para o fluxo de agendamento: calendário claro por profissional, estados de confirmação bem visíveis.
- **Notion** → referência para o módulo de prontuário/arquivos: organização limpa, hierarquia clara de documentos por paciente.
- **Linear** → referência para o dashboard administrativo: minimalista, denso em informação sem poluir, foco em produtividade.
- Paleta neutra, tipografia limpa, cards e whitespace generoso. Dark mode não é requisito do PRD — não presumir.

## Roadmap / marcos (ordem de prioridade)

1. Fundação: login/autenticação, multi-usuário, permissões por perfil
2. Agendamento: calendário por profissional/sala, confirmação, remarcação, cancelamento, bloqueio de horários
3. Estoque: cadastro de itens, entrada/saída, validade e lote, alerta de estoque mínimo
4. Prontuário/arquivos do paciente: upload e organização de exames, receitas e documentos, controle de acesso
5. Relatórios e exportação
6. CRM: funil de leads/prospects até a conversão em paciente
7. Orçamentos: tabela de procedimentos/preços e geração de orçamento por paciente
8. Financeiro: contas a receber, pagamentos, despesas e inadimplência, a partir dos orçamentos aprovados
9. Automações: motor de regras configurável pela clínica (gatilho, condição, ação)
10. Dashboard operacional: visão geral do dia a dia, distinta dos relatórios analíticos
11. Integração WhatsApp + agente de IA (etapa final): atendimento, agendamento e lembretes automáticos, com handoff para humano

Cada marco deve ser testado antes de avançar para o próximo.
