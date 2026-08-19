import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/lib/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * `max` baixo de propósito: em produção o DATABASE_URL passa pelo pooler do
 * Supabase em modo Transaction (PgBouncer) — cada instância serverless da
 * Vercel abre o próprio pool aqui, e um `max` alto (o padrão do adapter é
 * 10) multiplicado por várias instâncias concorrentes estoura o limite do
 * PgBouncer mesmo em modo Transaction. Sem impacto perceptível: as queries
 * paralelas de uma mesma requisição (ex.: os 8 `Promise.all` do dashboard)
 * só passam a rodar em lotes menores, não sequencialmente uma a uma.
 */
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 5 });

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
