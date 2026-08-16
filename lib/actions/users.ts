"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth";
import type { UserRole } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";

export type UserActionState = {
  error?: string;
  success?: boolean;
};

async function requireGestor() {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "gestor") {
    return null;
  }
  return currentUser;
}

export async function inviteUser(
  _prevState: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  const currentUser = await requireGestor();
  if (!currentUser) {
    return { error: "Você não tem permissão para convidar usuários." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const role = String(formData.get("role") ?? "") as UserRole;

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email);

  if (error) {
    return {
      error:
        error.code === "email_exists"
          ? "Esse e-mail já está cadastrado."
          : "Não foi possível enviar o convite. Tente novamente.",
    };
  }

  await prisma.user.create({
    data: {
      id: data.user.id,
      clinicId: currentUser.clinicId,
      name,
      email,
      role,
      status: "convite_pendente",
    },
  });

  revalidatePath("/configuracoes");
  return { success: true };
}

export async function updateUser(
  _prevState: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  const currentUser = await requireGestor();
  if (!currentUser) {
    return { error: "Você não tem permissão para editar usuários." };
  }

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const role = String(formData.get("role") ?? "") as UserRole;

  await prisma.user.update({
    where: { id, clinicId: currentUser.clinicId },
    data: { name, role },
  });

  revalidatePath("/configuracoes");
  return { success: true };
}

export async function removeUser(userId: string): Promise<UserActionState> {
  const currentUser = await requireGestor();
  if (!currentUser) {
    return { error: "Você não tem permissão para remover usuários." };
  }

  await prisma.user.delete({ where: { id: userId, clinicId: currentUser.clinicId } });

  const admin = createAdminClient();
  await admin.auth.admin.deleteUser(userId);

  revalidatePath("/configuracoes");
  return { success: true };
}
