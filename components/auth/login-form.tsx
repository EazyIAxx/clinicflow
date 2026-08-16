"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { handleLoginStep } from "@/lib/actions/auth";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(handleLoginStep, {});

  if (state.needsVerification) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Verifique seu e-mail</CardTitle>
          <CardDescription>
            Muitas tentativas com essa conta. Enviamos um código de 6 dígitos pro seu e-mail —
            digite abaixo pra continuar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" action={formAction}>
            <input type="hidden" name="intent" value="verify" />
            <input type="hidden" name="email" value={state.email} />
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="code">Código de verificação</Label>
              <Input
                id="code"
                name="code"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                required
              />
            </div>
            {state.error && <p className="text-destructive text-sm">{state.error}</p>}
            <Button type="submit" className="mt-2 w-full" disabled={isPending}>
              {isPending ? "Verificando..." : "Verificar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Entrar</CardTitle>
        <CardDescription>Acesse sua conta para gerenciar a clínica.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-4" action={formAction}>
          {state.verified && (
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              E-mail verificado! Digite sua senha pra entrar.
            </p>
          )}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={state.email}
              placeholder="voce@clinica.com"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Senha</Label>
              <Link href="#" className="text-muted-foreground hover:text-foreground text-xs">
                Esqueceu a senha?
              </Link>
            </div>
            <Input id="password" name="password" type="password" required />
          </div>
          {state.error && !state.verified && (
            <p className="text-destructive text-sm">{state.error}</p>
          )}
          <Button type="submit" className="mt-2 w-full" disabled={isPending}>
            {isPending ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="text-muted-foreground justify-center text-center text-sm">
        Não tem uma conta?{" "}
        <Link href="/register" className="text-foreground font-medium hover:underline">
          Criar conta
        </Link>
      </CardFooter>
    </Card>
  );
}
