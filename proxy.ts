import { type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Rotas de API ficam fora do redirect de sessão da página — implementam a
  // própria autenticação (ex.: app/api/lembretes usa um segredo no header,
  // não cookie de sessão, porque quem chama é um job, não um navegador logado).
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
