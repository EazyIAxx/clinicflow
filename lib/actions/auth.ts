"use server";

import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export type AuthActionState = {
  error?: string;
  success?: boolean;
};

export async function login(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "E-mail ou senha incorretos." };
  }

  redirect("/dashboard");
}

export async function register(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const clinicName = String(formData.get("clinicName") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
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
