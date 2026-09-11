"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/require-session";
import { hashPassword } from "@/lib/password";
import { revalidatePath } from "next/cache";

export type UserActionState = { error?: string; success?: boolean };

export async function createUser(
  _prevState: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  await requireSession();

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");

  if (!name) {
    return { error: "Name ist erforderlich." };
  }
  if (!email || !email.includes("@")) {
    return { error: "Gültige E-Mail-Adresse erforderlich." };
  }
  if (password.length < 6) {
    return { error: "Passwort muss mindestens 6 Zeichen haben." };
  }
  if (password !== passwordConfirm) {
    return { error: "Passwörter stimmen nicht überein." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Diese E-Mail-Adresse wird bereits verwendet." };
  }

  const passwordHash = await hashPassword(password);

  try {
    await prisma.user.create({ data: { name, email, passwordHash } });
  } catch {
    return { error: "Familienmitglied konnte nicht angelegt werden." };
  }

  revalidatePath("/users");
  revalidatePath("/items/new");
  return { success: true };
}
