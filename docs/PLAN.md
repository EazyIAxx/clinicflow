# PLAN.md — Roadmap de Execução do ClinicFlow

> Referências: [CLAUDE.md](../CLAUDE.md) (stack, convenções, estrutura de pastas) e [docs/PRD.md](PRD.md) (requisitos e personas).

Este plano organiza a construção do ClinicFlow do setup até o deploy, em ordem de execução. A estratégia é: **1) montar toda a interface primeiro**, com dados mockados, para validar fluxo e visual de cada módulo rapidamente; **2) implementar o backend depois**, módulo a módulo, conectando cada tela real ao banco de dados; **3) integrar WhatsApp + agente de IA** por último (conforme o PRD); **4) fazer o deploy de produção**.

Cada milestone parte de `main`, tem sua própria branch, e deve ser testado manualmente antes de seguir para o próximo (processo definido no PRD).

---

## Fase 0 — Setup

### M0. Setup inicial do projeto

- **Branch**: `chore/setup-inicial`
- **Objetivo**: inicializar o projeto Next.js com a stack definida no CLAUDE.md e deixar o deploy contínuo funcionando desde o primeiro commit.
- **Entregas**:
  - [x] Inicializar repositório Git
  - [x] Criar projeto Next.js (App Router + TypeScript)
  - [x] Configurar Tailwind CSS + shadcn/ui (tema base neutro)
  - [x] Criar estrutura de pastas conforme CLAUDE.md (`app/`, `components/`, `lib/`, `prisma/`, `docs/`)
  - [x] Configurar ESLint + Prettier
  - [ ] Configurar deploy contínuo (Vercel) com página placeholder publicada — CLI pronta via `npx vercel`; falta rodar `vercel login` (login manual, exige navegador) e depois `vercel` para publicar
- **Commit final**: `chore: setup inicial do projeto (Next.js, Tailwind, shadcn/ui, estrutura de pastas)` ✅ (branch `chore/setup-inicial`, mergeada em `main`)

---

## Fase 1 — Interface (dados mockados, sem backend real)

### M1. UI de autenticação + shell do dashboard

- **Branch**: `feature/ui-auth-shell`
- **Objetivo**: construir as telas de entrada no sistema e o layout de navegação do dashboard, sem lógica de autenticação real.
- **Entregas**:
  - [x] Tela de login (UI)
  - [x] Tela de registro (UI)
  - [x] Layout do dashboard: sidebar + topbar (estilo Linear)
  - [x] Navegação entre módulos (agenda, estoque, pacientes, prontuários, relatórios, configurações) com dados mockados
  - [x] Componentes base shadcn/ui configurados (button, input, card, dialog, table, etc.)
- **Commit final**: `feat(ui): telas de login/registro e shell de navegação do dashboard` ✅ (branch `feature/ui-auth-shell`, mergeada em `main`)

### M2. UI de agendamento

- **Branch**: `feature/ui-agenda`
- **Objetivo**: interface completa do módulo de agenda com dados mockados, seguindo a referência visual Doctoralia/iClinic.
- **Entregas**:
  - [x] Calendário por profissional/sala (visualização dia/semana)
  - [x] Modal/formulário de novo agendamento
  - [x] Estados visuais de confirmação, remarcação, cancelamento e bloqueio de horário
  - [x] Dados mockados de profissionais e consultas
- **Commit final**: `feat(ui): interface do módulo de agendamento` ✅ (branch `feature/ui-agenda`, mergeada em `main`)

### M3. UI de estoque

- **Branch**: `feature/ui-estoque`
- **Objetivo**: interface completa do módulo de estoque com dados mockados.
- **Entregas**:
  - [ ] Listagem de itens (materiais/medicamentos) com busca e filtros
  - [ ] Formulário de cadastro/edição de item
  - [ ] Tela de entrada/saída de estoque
  - [ ] Indicadores visuais de estoque mínimo e validade próxima
- **Commit final**: `feat(ui): interface do módulo de estoque`

### M4. UI de pacientes + prontuário/arquivos

- **Branch**: `feature/ui-prontuario`
- **Objetivo**: interface de cadastro de pacientes e do módulo de prontuário/arquivos, seguindo a referência visual Notion.
- **Entregas**:
  - [ ] Listagem e cadastro de pacientes com busca/filtros
  - [ ] Página de perfil do paciente
  - [ ] Upload de arquivos (UI) organizados por paciente/categoria (exames, receitas, documentos)
  - [ ] Indicação visual de controle de acesso por perfil
- **Commit final**: `feat(ui): interface de pacientes e prontuário/arquivos`

### M5. UI de relatórios + configurações

- **Branch**: `feature/ui-relatorios-config`
- **Objetivo**: dashboards de relatórios e telas de configuração/permissões, seguindo a referência visual Linear.
- **Entregas**:
  - [ ] Dashboard de relatórios (métricas de agenda/estoque) com dados mockados
  - [ ] Ação de exportação (UI, sem lógica real ainda)
  - [ ] Tela de gerenciamento de usuários e permissões por perfil
  - [ ] Tela de configurações da clínica
- **Commit final**: `feat(ui): interface de relatórios, exportação e configurações`

---

## Fase 2 — Backend (conectando cada módulo aos dados reais)

### M6. Banco de dados + autenticação real

- **Branch**: `feature/backend-auth-db`
- **Objetivo**: colocar Supabase e Prisma no ar e substituir o mock de autenticação do M1 por login real com permissões por perfil.
- **Entregas**:
  - [ ] Configurar projeto Supabase (Postgres, Auth, Storage)
  - [ ] Definir schema Prisma inicial (usuários, perfis/roles, clínica)
  - [ ] Rodar migrations iniciais
  - [ ] Implementar login/registro real com Supabase Auth
  - [ ] Implementar RLS e checagem de permissões por perfil (recepcionista, profissional, gestor/admin)
  - [ ] Configurar Resend e enviar e-mails de autenticação (confirmação de cadastro, redefinição de senha, convite de usuário)
- **Commit final**: `feat(backend): banco de dados, autenticação e permissões reais`

### M7. Backend de agendamento

- **Branch**: `feature/backend-agenda`
- **Objetivo**: implementar a lógica real de agendamento e conectar à UI construída no M2.
- **Entregas**:
  - [ ] Schema Prisma de profissionais, salas e consultas
  - [ ] Server Actions de criar/editar/cancelar/remarcar consulta
  - [ ] Validação de conflito de horário e bloqueio de agenda
  - [ ] Conectar UI de agenda (M2) aos dados reais
- **Commit final**: `feat(backend): lógica de agendamento e integração com a UI`

### M8. Backend de estoque

- **Branch**: `feature/backend-estoque`
- **Objetivo**: implementar a lógica real de estoque e conectar à UI construída no M3.
- **Entregas**:
  - [ ] Schema Prisma de itens, lotes e movimentações
  - [ ] Server Actions de entrada/saída de estoque
  - [ ] Lógica de alerta de estoque mínimo e validade
  - [ ] Conectar UI de estoque (M3) aos dados reais
- **Commit final**: `feat(backend): lógica de estoque e integração com a UI`

### M9. Backend de pacientes + prontuário/arquivos

- **Branch**: `feature/backend-prontuario`
- **Objetivo**: implementar cadastro real de pacientes e armazenamento de arquivos, conectando à UI construída no M4.
- **Entregas**:
  - [ ] Schema Prisma de pacientes e documentos
  - [ ] Upload real de arquivos via Supabase Storage
  - [ ] RLS de controle de acesso por perfil em tabelas e storage
  - [ ] Conectar UI de pacientes/prontuário (M4) aos dados reais
- **Commit final**: `feat(backend): cadastro de pacientes, upload e controle de acesso a arquivos`

### M10. Backend de relatórios

- **Branch**: `feature/backend-relatorios`
- **Objetivo**: implementar relatórios reais e exportação, conectando à UI construída no M5.
- **Entregas**:
  - [ ] Queries agregadas para métricas de agenda/estoque
  - [ ] Exportação de relatórios (CSV/PDF)
  - [ ] Conectar dashboard de relatórios (M5) aos dados reais
- **Commit final**: `feat(backend): relatórios reais e exportação de dados`

### M11. Notificações + chat interno

- **Branch**: `feature/notificacoes-chat`
- **Objetivo**: cobrir os requisitos funcionais de notificações e chat/mensagens internas da equipe.
- **Entregas**:
  - [ ] Sistema de notificações in-app (lembretes de consulta, alertas de estoque)
  - [ ] Job/cron de lembretes automáticos
  - [ ] E-mails de confirmação/lembrete de consulta via Resend
  - [ ] Chat/mensagens internas entre membros da equipe
- **Commit final**: `feat: notificações e chat interno`

---

## Fase 3 — Integração final e deploy

### M12. Integração WhatsApp + agente de IA

- **Branch**: `feature/whatsapp-ai-agent`
- **Objetivo**: etapa final do PRD — conectar o sistema ao WhatsApp Business Platform com um agente de IA para atendimento automático.
- **Entregas**:
  - [ ] Configurar WhatsApp Business Platform (API oficial Meta) e webhook de mensagens
  - [ ] Implementar agente de IA (Claude API) para agendamento, dúvidas frequentes e lembretes via WhatsApp
  - [ ] Implementar handoff para atendente humano
  - [ ] Testar o fluxo completo de atendimento via WhatsApp de ponta a ponta
- **Commit final**: `feat: integração com WhatsApp Business Platform e agente de IA de atendimento`

### M13. Deploy e produção

- **Branch**: `chore/deploy-producao`
- **Objetivo**: preparar e executar o deploy de produção completo do ClinicFlow.
- **Entregas**:
  - [ ] Configurar variáveis de ambiente de produção (Supabase, WhatsApp, Claude API)
  - [ ] Revisão de segurança (RLS, chaves de API, rate limiting em webhooks)
  - [ ] Configurar CI/CD (build, lint e testes antes do deploy)
  - [ ] Deploy em produção (Vercel + Supabase)
  - [ ] Smoke test em produção de todos os módulos
- **Commit final**: `chore: configuração de produção e deploy final`

---

## Notas

- Convenção de branch: `chore/...` para setup e infraestrutura, `feature/...` para funcionalidades — todas partindo de `main`.
- Deploy assumido em Vercel (combina naturalmente com Next.js + Supabase); ajustar se a hospedagem final for outra.
- Cada milestone deve ser testado manualmente end-to-end antes de iniciar o próximo, conforme o processo definido no PRD.
