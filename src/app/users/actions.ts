"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/require-session";
import { hashPassword } from "@/lib/password";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isUserRole } from "@/lib/roles";

export type UserActionState = { error?: string; success?: boolean };

export async function createUser(
  _prevState: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  const session = await requireSession();
  if (session.userRole !== "ADMIN") {
    return { error: "Nur Admins dürfen neue Familienmitglieder anlegen." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");
  const role = formData.get("role");

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
  if (!isUserRole(role)) {
    return { error: "Ungültige Benutzergruppe." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Diese E-Mail-Adresse wird bereits verwendet." };
  }

  const passwordHash = await hashPassword(password);

  try {
    await prisma.user.create({ data: { name, email, passwordHash, role } });
  } catch {
    return { error: "Familienmitglied konnte nicht angelegt werden." };
  }

  revalidatePath("/users");
  revalidatePath("/items/new");
  return { success: true };
}

export async function updateUser(
  userId: string,
  _prevState: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  const session = await requireSession();
  if (session.userRole !== "ADMIN") {
    return { error: "Nur Admins dürfen Familienmitglieder bearbeiten." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const role = formData.get("role");
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");

  if (!name) {
    return { error: "Name ist erforderlich." };
  }
  if (!email || !email.includes("@")) {
    return { error: "Gültige E-Mail-Adresse erforderlich." };
  }
  if (!isUserRole(role)) {
    return { error: "Ungültige Benutzergruppe." };
  }
  if (password || passwordConfirm) {
    if (password.length < 6) {
      return { error: "Passwort muss mindestens 6 Zeichen haben." };
    }
    if (password !== passwordConfirm) {
      return { error: "Passwörter stimmen nicht überein." };
    }
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing && existing.id !== userId) {
    return { error: "Diese E-Mail-Adresse wird bereits verwendet." };
  }

  const current = await prisma.user.findUnique({ where: { id: userId } });
  if (!current) {
    return { error: "Familienmitglied wurde nicht gefunden." };
  }

  // Verhindern, dass der letzte verbleibende Admin sich selbst (oder ein
  // anderer Admin) versehentlich herabgestuft wird - sonst kann niemand mehr
  // Benutzer verwalten.
  if (current.role === "ADMIN" && role !== "ADMIN") {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    if (adminCount <= 1) {
      return {
        error: "Es muss mindestens ein Admin bestehen bleiben.",
      };
    }
  }

  const data: {
    name: string;
    email: string;
    role: string;
    passwordHash?: string;
  } = { name, email, role };

  if (password) {
    data.passwordHash = await hashPassword(password);
  }

  try {
    await prisma.user.update({ where: { id: userId }, data });
  } catch {
    return { error: "Familienmitglied konnte nicht gespeichert werden." };
  }

  revalidatePath("/users");
  redirect("/users");
}
