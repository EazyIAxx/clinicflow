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
import { register } from "@/lib/actions/auth";

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(register, {});

  if (state.success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quase lá!</CardTitle>
          <CardDescription>
            Enviamos um link de confirmação para o seu e-mail. Clique nele pra ativar sua conta e
            fazer login.
          </CardDescription>
        </CardHeader>
        <CardFooter className="text-muted-foreground justify-center text-center text-sm">
          <Link href="/login" className="text-foreground font-medium hover:underline">
            Voltar para o login
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Criar conta</CardTitle>
        <CardDescription>Cadastre sua clínica para começar a usar o ClinicFlow.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-4" action={formAction}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="clinicName">Nome da clínica</Label>
            <Input id="clinicName" name="clinicName" placeholder="Clínica ClinicFlow" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Nome completo</Label>
            <Input id="name" name="name" placeholder="Seu nome" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" name="email" type="email" placeholder="voce@clinica.com" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" name="password" type="password" required minLength={6} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirm-password">Confirmar senha</Label>
            <Input
              id="confirm-password"
              name="confirmPassword"
              type="password"
              required
              minLength={6}
            />
          </div>
          {state.error && <p className="text-destructive text-sm">{state.error}</p>}
          <Button type="submit" className="mt-2 w-full" disabled={isPending}>
            {isPending ? "Criando conta..." : "Criar conta"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="text-muted-foreground justify-center text-center text-sm">
        Já tem uma conta?{" "}
        <Link href="/login" className="text-foreground font-medium hover:underline">
          Entrar
        </Link>
      </CardFooter>
    </Card>
  );
}
