-- Corrige um alerta CRÍTICO de segurança do Supabase (Security Advisor:
-- rls_disabled_in_public): a tabela "_prisma_migrations" — criada
-- automaticamente pelo próprio Prisma na schema `public` pra controlar
-- quais migrations já foram aplicadas — não tinha RLS habilitado. Como
-- toda tabela em `public` é exposta pela API REST autogerada do Supabase
-- por padrão, isso deixava o histórico de nomes de migration (e,
-- teoricamente, escrita/apagamento de linhas) acessível por qualquer
-- pessoa com a URL do projeto e a anon key.
--
-- Não é uma tabela do schema.prisma (não tem model correspondente) — é só
-- infraestrutura interna do Prisma CLI, que sempre acessa o banco via a
-- role `postgres` e por isso nunca é afetado por RLS. Habilitar RLS aqui
-- sem nenhuma policy resulta em negar acesso por padrão pras roles `anon`
-- e `authenticated` da API REST, sem quebrar `prisma migrate deploy`.

ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;
