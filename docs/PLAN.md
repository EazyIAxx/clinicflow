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
  - [x] Listagem de itens (materiais/medicamentos) com busca e filtros
  - [x] Formulário de cadastro/edição de item
  - [x] Tela de entrada/saída de estoque
  - [x] Indicadores visuais de estoque mínimo e validade próxima
- **Commit final**: `feat(ui): interface do módulo de estoque` ✅ (branch `feature/ui-estoque`, mergeada em `main`)

### M4. UI de pacientes + prontuário/arquivos

- **Branch**: `feature/ui-prontuario`
- **Objetivo**: interface de cadastro de pacientes e do módulo de prontuário/arquivos, seguindo a referência visual Notion.
- **Entregas**:
  - [x] Listagem e cadastro de pacientes com busca/filtros
  - [x] Página de perfil do paciente
  - [x] Upload de arquivos (UI) organizados por paciente/categoria (exames, receitas, documentos)
  - [x] Indicação visual de controle de acesso por perfil
- **Commit final**: `feat(ui): interface de pacientes e prontuário/arquivos` ✅ (branch `feature/ui-prontuario`, PR #1, mergeada em `main`)

### M5. UI de relatórios + configurações

- **Branch**: `feature/ui-relatorios-config`
- **Objetivo**: dashboards de relatórios e telas de configuração/permissões, seguindo a referência visual Linear.
- **Entregas**:
  - [x] Dashboard de relatórios (métricas de agenda/estoque) com dados mockados
  - [x] Ação de exportação (UI, sem lógica real ainda)
  - [x] Tela de gerenciamento de usuários e permissões por perfil
  - [x] Tela de configurações da clínica
- **Commit final**: `feat(ui): interface de relatórios, exportação e configurações` ✅ (branch `feature/ui-relatorios-config`, PR #3, mergeada em `main`)

### M6. UI de CRM (funil de leads)

- **Branch**: `feature/ui-crm`
- **Objetivo**: interface de funil de leads/prospects — pessoas interessadas que ainda não são pacientes — da recepção do primeiro contato até a conversão em paciente agendado. Complementa o M4, que só cobre quem já é paciente.
- **Entregas**:
  - [x] Quadro Kanban de leads por etapa (novo contato → em conversa → agendado → convertido / perdido)
  - [x] Cadastro de lead (nome, contato, origem, interesse, responsável)
  - [x] Ficha do lead com histórico de interações (notas, ligações, mensagens)
  - [x] Conversão de lead em paciente (integra com o cadastro do M4)
- **Commit final**: `feat(ui): interface de CRM (funil de leads)` ✅ (branch `feature/ui-crm`, PR #4, mergeada em `main`)

### M7. UI de orçamentos

- **Branch**: `feature/ui-orcamentos`
- **Objetivo**: geração de orçamentos de procedimentos para o paciente, com tabela de preços — base para as cobranças do M8.
- **Entregas**:
  - [x] Tabela de procedimentos e preços (cadastro)
  - [x] Criação de orçamento por paciente (itens, valores, desconto, validade)
  - [x] Estados do orçamento (rascunho, enviado, aprovado, recusado, expirado)
  - [x] Visualização/compartilhamento do orçamento com o paciente (UI)
- **Commit final**: `feat(ui): interface de orçamentos` ✅ (branch `feature/ui-orcamentos`, PR #5, mergeada em `main`)

### M8. UI financeiro

- **Branch**: `feature/ui-financeiro`
- **Objetivo**: cobranças e fluxo de caixa a partir dos orçamentos aprovados (M7) e das consultas realizadas.
- **Entregas**:
  - [ ] Contas a receber (vinculadas a orçamentos aprovados e consultas)
  - [ ] Registro de pagamento (forma, data, status)
  - [ ] Despesas gerais da clínica (cadastro simples)
  - [ ] Dashboard financeiro (receita do mês, pendências, inadimplência)
- **Commit final**: `feat(ui): interface financeira`

### M9. UI de automações

- **Branch**: `feature/ui-automacoes`
- **Objetivo**: motor de regras configurável pela própria clínica (gatilho → condição → ação) — mais genérico do que os lembretes fixos do M19 e complementar ao agente de IA do WhatsApp (M20), sem se limitar a eles.
- **Entregas**:
  - [ ] Listagem de regras/automações cadastradas
  - [ ] Criação de regra (gatilho + condição + ação — ex.: "X dias após consulta → enviar mensagem")
  - [ ] Modelos prontos de regras comuns (lembrete de retorno, estoque baixo, aniversário do paciente)
  - [ ] Ativar/pausar regras
- **Commit final**: `feat(ui): interface de automações`

### M10. UI de dashboard (visão geral operacional)

- **Branch**: `feature/ui-dashboard`
- **Objetivo**: home operacional do sistema — o que a recepção/gestor vê ao abrir o sistema no dia a dia. Diferente do M5 (Relatórios), que é analítico/histórico.
- **Entregas**:
  - [ ] Resumo da agenda do dia (próximos horários, confirmações pendentes)
  - [ ] Pendências entre módulos (orçamentos aguardando aprovação, estoque crítico, leads sem retorno)
  - [ ] Atalhos rápidos (novo agendamento, novo paciente, novo orçamento, novo lead)
  - [ ] Feed de atividade recente
- **Commit final**: `feat(ui): dashboard operacional (visão geral)`

---

## Fase 2 — Backend (conectando cada módulo aos dados reais)

### M11. Banco de dados + autenticação real

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

### M12. Backend de agendamento

- **Branch**: `feature/backend-agenda`
- **Objetivo**: implementar a lógica real de agendamento e conectar à UI construída no M2.
- **Entregas**:
  - [ ] Schema Prisma de profissionais, salas e consultas
  - [ ] Server Actions de criar/editar/cancelar/remarcar consulta
  - [ ] Validação de conflito de horário e bloqueio de agenda
  - [ ] Conectar UI de agenda (M2) aos dados reais
- **Commit final**: `feat(backend): lógica de agendamento e integração com a UI`

### M13. Backend de estoque

- **Branch**: `feature/backend-estoque`
- **Objetivo**: implementar a lógica real de estoque e conectar à UI construída no M3.
- **Entregas**:
  - [ ] Schema Prisma de itens, lotes e movimentações
  - [ ] Server Actions de entrada/saída de estoque
  - [ ] Lógica de alerta de estoque mínimo e validade
  - [ ] Conectar UI de estoque (M3) aos dados reais
- **Commit final**: `feat(backend): lógica de estoque e integração com a UI`

### M14. Backend de pacientes + prontuário/arquivos

- **Branch**: `feature/backend-prontuario`
- **Objetivo**: implementar cadastro real de pacientes e armazenamento de arquivos, conectando à UI construída no M4.
- **Entregas**:
  - [ ] Schema Prisma de pacientes e documentos
  - [ ] Upload real de arquivos via Supabase Storage
  - [ ] RLS de controle de acesso por perfil em tabelas e storage
  - [ ] Conectar UI de pacientes/prontuário (M4) aos dados reais
- **Commit final**: `feat(backend): cadastro de pacientes, upload e controle de acesso a arquivos`

### M15. Backend de relatórios

- **Branch**: `feature/backend-relatorios`
- **Objetivo**: implementar relatórios reais e exportação, conectando à UI construída no M5. Também alimenta o dashboard operacional do M10, que agrega dados dos demais módulos já com backend.
- **Entregas**:
  - [ ] Queries agregadas para métricas de agenda/estoque
  - [ ] Exportação de relatórios (CSV/PDF)
  - [ ] Conectar dashboard de relatórios (M5) aos dados reais
  - [ ] Conectar dashboard operacional (M10) aos dados reais
- **Commit final**: `feat(backend): relatórios reais e exportação de dados`

### M16. Backend de CRM

- **Branch**: `feature/backend-crm`
- **Objetivo**: implementar o funil de leads real e conectar à UI construída no M6.
- **Entregas**:
  - [ ] Schema Prisma de leads e interações
  - [ ] Server Actions de criar/mover/converter lead em paciente
  - [ ] Conectar UI de CRM (M6) aos dados reais
- **Commit final**: `feat(backend): funil de leads real e integração com a UI`

### M17. Backend de orçamentos + financeiro

- **Branch**: `feature/backend-orcamentos-financeiro`
- **Objetivo**: implementar orçamentos e cobranças reais, conectando às UIs construídas no M7 e M8.
- **Entregas**:
  - [ ] Schema Prisma de procedimentos, orçamentos e cobranças
  - [ ] Server Actions de criar/aprovar orçamento e gerar cobrança
  - [ ] Registro real de pagamentos e cálculo de inadimplência
  - [ ] Conectar UI de orçamentos (M7) e financeiro (M8) aos dados reais
- **Commit final**: `feat(backend): orçamentos e financeiro reais`

### M18. Backend de automações

- **Branch**: `feature/backend-automacoes`
- **Objetivo**: implementar a execução real das regras de automação e conectar à UI construída no M9.
- **Entregas**:
  - [ ] Schema Prisma de regras de automação
  - [ ] Motor de execução (job/cron) que avalia gatilhos e dispara ações
  - [ ] Conectar UI de automações (M9) aos dados reais
- **Commit final**: `feat(backend): motor de automações real`

### M19. Notificações + chat interno

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

### M20. Integração WhatsApp + agente de IA

- **Branch**: `feature/whatsapp-ai-agent`
- **Objetivo**: etapa final do PRD — conectar o sistema ao WhatsApp Business Platform com um agente de IA para atendimento automático.
- **Entregas**:
  - [ ] Configurar WhatsApp Business Platform (API oficial Meta) e webhook de mensagens
  - [ ] Implementar agente de IA (Claude API) para agendamento, dúvidas frequentes e lembretes via WhatsApp
  - [ ] Implementar handoff para atendente humano
  - [ ] Testar o fluxo completo de atendimento via WhatsApp de ponta a ponta
- **Commit final**: `feat: integração com WhatsApp Business Platform e agente de IA de atendimento`

### M21. Deploy e produção

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
