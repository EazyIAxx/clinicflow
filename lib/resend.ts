import { Resend } from "resend";

/**
 * Inicialização preguiçosa: `new Resend(...)` valida a API key no
 * construtor e lança na hora se faltar. Como o Next.js avalia esse módulo
 * ao coletar a configuração das rotas em build time (não só em runtime),
 * um `RESEND_API_KEY` ausente numa variável de ambiente derrubava o build
 * inteiro mesmo em rotas que não enviam e-mail nenhum. O client real só é
 * criado no primeiro uso de verdade, em runtime.
 */
let client: Resend | undefined;

export const resend = new Proxy({} as Resend, {
  get(_target, prop, receiver) {
    if (!client) client = new Resend(process.env.RESEND_API_KEY);
    return Reflect.get(client, prop, receiver);
  },
});
