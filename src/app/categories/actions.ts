"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/require-session";
import { revalidatePath } from "next/cache";

export type CategoryActionState = { error?: string; success?: boolean };

export async function createCategory(
  _prevState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  await requireSession();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return { error: "Name ist erforderlich." };
  }

  const existing = await prisma.category.findUnique({ where: { name } });
  if (existing) {
    return { error: "Diese Kategorie gibt es schon." };
  }

  try {
    await prisma.category.create({ data: { name } });
  } catch {
    return { error: "Kategorie konnte nicht angelegt werden." };
  }

  revalidatePath("/categories");
  revalidatePath("/items/new");
  revalidatePath("/reports");
  return { success: true };
}

export async function deleteCategory(
  categoryId: string,
): Promise<{ error?: string }> {
  await requireSession();

  const itemCount = await prisma.item.count({ where: { categoryId } });
  if (itemCount > 0) {
    return {
      error: `Diese Kategorie wird noch von ${itemCount} Gegenstand/Gegenständen verwendet und kann nicht gelöscht werden.`,
    };
  }

  try {
    await prisma.category.delete({ where: { id: categoryId } });
  } catch {
    return { error: "Kategorie konnte nicht gelöscht werden." };
  }

  revalidatePath("/categories");
  revalidatePath("/items/new");
  revalidatePath("/reports");
  return {};
}
