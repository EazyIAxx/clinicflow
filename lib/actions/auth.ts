"use server";

import { createHash } from "node:crypto";

import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";
import { createClient } from "@/lib/supabase/server";

export type AuthActionState = {
  error?: string;
  success?: boolean;
  needsVerification?: boolean;
  verified?: boolean;
  email?: string;
};

const MAX_LOGIN_ATTEMPTS = 3;
const MAX_VERIFICATION_ATTEMPTS = 5;
const CODE_TTL_MINUTES = 10;

function hashCode(code: string) {
  return createHash("sha256").update(code).digest("hex");
}

async function sendVerificationCode(userId: string, email: string, name: string) {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000);

  await prisma.user.update({
    where: { id: userId },
    data: {
      verificationCodeHash: hashCode(code),
      verificationCodeExpiresAt: expiresAt,
      verificationAttempts: 0,
    },
  });

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: email,
    subject: "Código de verificação — ClinicFlow",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #059669;">ClinicFlow</h2>
        <p>Olá, ${name}. Detectamos várias tentativas de login com a senha errada na sua conta.</p>
        <p>Pra continuar, digite o código abaixo na tela de login:</p>
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; background: #f1f5f9; padding: 16px; border-radius: 8px;">
          ${code}
        </p>
        <p style="color: #64748b; font-size: 14px;">
          Esse código expira em ${CODE_TTL_MINUTES} minutos. Se não foi você, pode ignorar este
          e-mail — sua senha continua protegida.
        </p>
      </div>
    `,
  });

  if (error) {
    console.error("Falha ao enviar e-mail de verificação:", error);
  }
}

export async function login(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser && existingUser.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
    const codeStillValid =
      existingUser.verificationCodeExpiresAt && existingUser.verificationCodeExpiresAt > new Date();
    if (!codeStillValid) {
      await sendVerificationCode(existingUser.id, existingUser.email, existingUser.name);
    }
    return {
      needsVerification: true,
      email,
      error: "Muitas tentativas com essa conta. Digite o código que enviamos pro seu e-mail.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (existingUser) {
      const attempts = existingUser.failedLoginAttempts + 1;
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { failedLoginAttempts: attempts },
      });

      if (attempts >= MAX_LOGIN_ATTEMPTS) {
        await sendVerificationCode(existingUser.id, existingUser.email, existingUser.name);
        return {
          needsVerification: true,
          email,
          error: "Muitas tentativas com essa conta. Digite o código que enviamos pro seu e-mail.",
        };
      }
    }
    return { error: "E-mail ou senha incorretos.", email };
  }

  if (existingUser && existingUser.failedLoginAttempts > 0) {
    await prisma.user.update({
      where: { id: existingUser.id },
      data: { failedLoginAttempts: 0 },
    });
  }

  redirect("/dashboard");
}

export async function verifyLoginCode(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const code = String(formData.get("code") ?? "").trim();

  const user = await prisma.user.findUnique({ where: { email } });

  if (
    !user ||
    !user.verificationCodeHash ||
    !user.verificationCodeExpiresAt ||
    user.verificationCodeExpiresAt < new Date()
  ) {
    return {
      needsVerification: true,
      email,
      error: "Código expirado. Tente entrar de novo pra receber um novo código.",
    };
  }

  if (user.verificationAttempts >= MAX_VERIFICATION_ATTEMPTS) {
    await prisma.user.update({
      where: { id: user.id },
      data: { verificationCodeHash: null, verificationCodeExpiresAt: null },
    });
    return {
      needsVerification: true,
      email,
      error: "Muitas tentativas. Tente entrar de novo pra receber um novo código.",
    };
  }

  if (hashCode(code) !== user.verificationCodeHash) {
    await prisma.user.update({
      where: { id: user.id },
      data: { verificationAttempts: { increment: 1 } },
    });
    return { needsVerification: true, email, error: "Código inválido." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: 0,
      verificationAttempts: 0,
      verificationCodeHash: null,
      verificationCodeExpiresAt: null,
    },
  });

  return { verified: true, email };
}

/**
 * Único ponto de entrada usado pelo formulário de login — despacha pra
 * `login` ou `verifyLoginCode` conforme o campo oculto "intent". Existe pra
 * dar aos dois passos (senha / código) o mesmo useActionState no client:
 * como cada submit substitui o estado inteiro (não faz merge), não sobra
 * resquício de um "verified: true" antigo se a conta cair num segundo
 * bloqueio mais tarde.
 */
export async function handleLoginStep(
  prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (formData.get("intent") === "verify") {
    return verifyLoginCode(prevState, formData);
  }
  return login(prevState, formData);
}

export async function register(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const clinicName = String(formData.get("clinicName") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (password !== confirmPassword) {
    return { error: "As senhas não coincidem." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return {
      error:
        error.code === "user_already_exists"
          ? "Esse e-mail já está cadastrado."
          : "Não foi possível criar a conta. Tente novamente.",
    };
  }

  if (!data.user) {
    return { error: "Não foi possível criar a conta. Tente novamente." };
  }

  const clinic = await prisma.clinic.create({ data: { name: clinicName } });
  await prisma.user.create({
    data: {
      id: data.user.id,
      clinicId: clinic.id,
      name,
      email,
      role: "gestor",
      status: "ativo",
    },
  });

  return { success: true };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
