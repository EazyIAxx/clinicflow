# Deploy de produção — ClinicFlow

Runbook do M21. Cobre o que já está pronto no repositório e o que precisa de ação manual (conta Vercel, secrets, primeiro deploy).

## 1. Variáveis de ambiente de produção

Lista exata das variáveis que o código realmente usa hoje (verificado via `grep -r process.env`). Preencher direto no painel da Vercel (Project Settings → Environment Variables), nunca em arquivo versionado.

Preencher pros ambientes **Production e Preview** (a Vercel deixa escolher por variável) — o primeiro deploy falhou justamente porque `RESEND_API_KEY` não estava disponível no ambiente que builda a PR. O `lib/resend.ts` já foi corrigido pra não derrubar o build inteiro se uma variável faltar (inicialização preguiçosa — só cria o client de verdade no primeiro uso em runtime), mas a rota de e-mail continua exigindo o valor real pra funcionar de fato.

| Variável                       | Onde usar          | Observação                                                                 |
| ------------------------------- | ------------------ | --------------------------------------------------------------------------- |
| `DATABASE_URL`                  | Produção            | Pooler do Supabase em **modo Transaction, porta 6543**, com `?pgbouncer=true` no final — ver nota abaixo |
| `NEXT_PUBLIC_SUPABASE_URL`      | Produção            | URL do projeto Supabase                                                     |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Produção            | Chave pública (anon) — protegida por RLS                                    |
| `SUPABASE_SERVICE_ROLE_KEY`     | Produção            | Chave admin — só usada server-side (Storage, criação de usuário em convite) |
| `RESEND_API_KEY`                | Produção            | Em modo sandbox hoje (`onboarding@resend.dev`) — trocar por domínio próprio antes do lançamento real, se aplicável |
| `RESEND_FROM_EMAIL`             | Produção            | Remetente dos e-mails transacionais                                        |
| `CRON_SECRET`                   | Produção            | Gerar um valor novo e forte pra produção (não reaproveitar o de dev)        |

Variáveis do `.env.example` que **não têm código nenhum usando ainda** (M20 — WhatsApp + agente de IA — foi propositalmente pulado): `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_WEBHOOK_VERIFY_TOKEN`, `ANTHROPIC_API_KEY`. Não preencher agora — só quando o M20 for retomado.

### Modo do pooler do Supabase (Session vs Transaction)

O primeiro deploy real caiu com `PrismaClientKnownRequestError: Invalid 'prisma.user.findUnique()' invocation: Database error` de forma intermitente em `/dashboard` — clássico esgotamento de pool de conexões. A causa: `DATABASE_URL` apontava pro pooler do Supabase na **porta 5432 (modo Session)**, que mantém conexões persistentes e tem um limite baixo — cada instância serverless da Vercel abre a própria conexão, e sob qualquer tráfego concorrente estoura o limite rápido.

A [documentação oficial do Supabase para Prisma em serverless](https://supabase.com/docs/guides/database/prisma) recomenda:

- **Em produção/runtime (Vercel)**: `DATABASE_URL` deve usar a **porta 6543 (modo Transaction)** do pooler, com `?pgbouncer=true` no final da string.
- **Localmente / pra rodar migrations**: a porta 5432 (modo Session) continua funcionando normalmente — não há pressão de conexões concorrentes com um único desenvolvedor rodando `prisma migrate deploy`.

Prisma 7 removeu o suporte a `directUrl` separado no `prisma.config.ts` (só existe `url`), então não dá pra configurar isso automaticamente por ambiente — é uma troca manual do valor de `DATABASE_URL` no painel da Vercel, mudando só a porta e adicionando o parâmetro:

```diff
- postgresql://postgres.PROJETO:SENHA@HOST.pooler.supabase.com:5432/postgres
+ postgresql://postgres.PROJETO:SENHA@HOST.pooler.supabase.com:6543/postgres?pgbouncer=true
```

O `.env` local continua na porta 5432 sem problema (usado tanto pro `next dev` quanto pras migrations).

## 2. Conectar a Vercel

1. Vercel → New Project → importar o repositório `EazyIAxx/clinicflow` do GitHub.
2. `vercel.json` declara `"framework": "nextjs"` explicitamente — necessário porque o repo tem alguns scripts `.py` vendorizados junto com skills do Claude Code (`.claude/skills/**/scripts/*.py`), e a detecção automática da Vercel os interpretou como sinal de projeto Python, tentando (e falhando) buildar como Python em vez de Next.js. Sem essa declaração explícita, o build falha com `Error: No python entrypoint found`.
3. `postinstall: prisma generate` no `package.json` garante o client gerado antes do build.
4. Preencher as variáveis da seção 1 em Production (e Preview, se quiser preview deployments funcionais).
5. Deploy.

## 3. CI (GitHub Actions)

`.github/workflows/ci.yml` roda lint + build em toda PR e push pra `main`, com variáveis de ambiente placeholder (não reais — lint/build não abrem conexão de verdade com nenhum serviço). Isso é o gate antes do merge; não substitui o smoke test manual pós-deploy da seção 4.

## 4. Smoke test pós-deploy

Depois do primeiro deploy, testar manualmente na URL de produção:

- [ ] `/login` carrega e autentica um usuário real
- [ ] `/dashboard` (Visão geral) mostra agenda do dia, pendências e atividade recente
- [ ] Criar um agendamento em `/agenda` e confirmar que o e-mail de confirmação é dispara (checar Resend dashboard, já que está em sandbox)
- [ ] `/estoque`, `/pacientes`, `/prontuarios`, `/crm`, `/orcamentos`, `/financeiro`, `/automacoes`, `/relatorios`, `/mensagens` carregam sem erro pro perfil Gestor
- [ ] Upload de um documento em Prontuário e confirmar que o signed URL abre o arquivo
- [ ] Exportar um relatório em CSV e em PDF
- [ ] Importar um CSV de despesas em Financeiro
- [ ] Sino de notificações aparece na topbar e não quebra o layout
- [ ] Testar com um segundo usuário (perfil Recepcionista) que as restrições de acesso (Financeiro, Relatórios = só Gestor) continuam valendo

## 5. Job de lembretes (`/api/lembretes`)

Ainda não tem Vercel Cron configurado (decisão consciente do M19 — fica pra quando o app for pro ar de verdade). Pra ativar depois do deploy:

1. Adicionar a chave `crons` ao `vercel.json` que já existe na raiz do repo:
   ```json
   {
     "$schema": "https://openapi.vercel.sh/vercel.json",
     "framework": "nextjs",
     "crons": [{ "path": "/api/lembretes", "schedule": "0 9 * * *" }]
   }
   ```
2. Vercel Cron chama a rota automaticamente sem precisar do header `Authorization` (a plataforma injeta isso via um mecanismo próprio) — **revisar a lógica de auth da rota antes de ativar**, já que hoje ela espera `Authorization: Bearer <CRON_SECRET>` manualmente. Ver a [documentação de Vercel Cron Jobs](https://vercel.com/docs/cron-jobs) pra confirmar o formato exato de autenticação usado pela plataforma na versão vigente no momento da ativação.

## 6. Notas de segurança já revisadas nesta milestone

- Todas as 20 tabelas do schema têm RLS habilitado; todas as 68 policies (incluindo Storage) restringem por `clinicId` da clínica atual ou por `auth.uid()` — nenhuma policy permissiva encontrada.
- Corrigida uma brecha real: as policies de INSERT/DELETE de `BudgetItem` só checavam o perfil do usuário, sem restringir pelo `clinicId` do Budget pai (migration `20260820100000_fix_budget_item_rls`). Não afetava o app (Prisma sempre escreve BudgetItem aninhado dentro de um Budget já filtrado por clínica), mas fechava uma brecha de acesso direto via API REST do Supabase.
- Toda Server Action de escrita passa por um helper `require*Manager()`/`requireGestor()` que valida perfil antes de qualquer mutação — conferido 1:1 (toda função exportada chama o helper).
- `.env` não está no controle de versão; nenhuma chave hardcoded encontrada no código.
- Projeto Supabase (`snwhcfgzdbqrepkdcjjt`) é dedicado só ao ClinicFlow — contas de auth não relacionadas (`*.triagemeazy.demo`) foram removidas nesta milestone.
