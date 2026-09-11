"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/require-session";
import { revalidatePath } from "next/cache";

export type ShoppingListActionState = { error?: string; success?: boolean };

export async function addShoppingListItem(
  _prevState: ShoppingListActionState,
  formData: FormData,
): Promise<ShoppingListActionState> {
  await requireSession();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return { error: "Bezeichnung ist erforderlich." };
  }
  const store = String(formData.get("store") ?? "").trim() || null;
  const quantity = String(formData.get("quantity") ?? "").trim() || null;

  try {
    await prisma.shoppingListItem.create({
      data: { name, store, quantity },
    });
  } catch {
    return { error: "Eintrag konnte nicht gespeichert werden." };
  }

  revalidatePath("/shopping-list");
  return { success: true };
}

export async function toggleShoppingListItem(
  id: string,
  checked: boolean,
): Promise<{ error?: string }> {
  await requireSession();

  try {
    await prisma.shoppingListItem.update({
      where: { id },
      data: { checked },
    });
  } catch {
    return { error: "Konnte nicht aktualisiert werden." };
  }

  revalidatePath("/shopping-list");
  return {};
}

export async function deleteShoppingListItem(
  id: string,
): Promise<{ error?: string }> {
  await requireSession();

  try {
    await prisma.shoppingListItem.delete({ where: { id } });
  } catch {
    return { error: "Konnte nicht gelöscht werden." };
  }

  revalidatePath("/shopping-list");
  return {};
}
