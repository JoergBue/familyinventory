"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/require-session";
import { revalidatePath } from "next/cache";

export type TodoActionState = { error?: string; success?: boolean };

function parseOptionalDate(value: FormDataEntryValue | null): Date | null {
  if (!value || typeof value !== "string" || value.trim() === "") return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function addTodo(
  _prevState: TodoActionState,
  formData: FormData,
): Promise<TodoActionState> {
  await requireSession();

  const title = String(formData.get("title") ?? "").trim();
  const assignedTo = String(formData.get("assignedTo") ?? "").trim();
  const areaId = formData.get("areaId");
  const dueDate = parseOptionalDate(formData.get("dueDate"));

  if (!title) {
    return { error: "Bitte angeben, was gemacht werden soll." };
  }
  if (!assignedTo) {
    return { error: "Bitte angeben, wer es tun soll." };
  }
  if (typeof areaId !== "string" || !areaId) {
    return { error: "Bereich ist erforderlich." };
  }

  try {
    await prisma.todo.create({
      data: { title, assignedTo, areaId, dueDate },
    });
  } catch {
    return { error: "ToDo konnte nicht gespeichert werden." };
  }

  revalidatePath("/todos");
  // "[areaId]" als Literal revalidiert die Seite für ALLE Bereiche, nicht
  // nur den aktuellen - siehe Next.js-Doku zu revalidatePath mit
  // dynamischen Segmenten.
  revalidatePath("/todos/[areaId]", "page");
  return { success: true };
}

export async function toggleTodo(
  id: string,
  done: boolean,
): Promise<{ error?: string }> {
  await requireSession();

  try {
    await prisma.todo.update({ where: { id }, data: { done } });
  } catch {
    return { error: "Konnte nicht aktualisiert werden." };
  }

  revalidatePath("/todos");
  revalidatePath("/todos/[areaId]", "page");
  return {};
}

export async function deleteTodo(id: string): Promise<{ error?: string }> {
  await requireSession();

  try {
    await prisma.todo.delete({ where: { id } });
  } catch {
    return { error: "Konnte nicht gelöscht werden." };
  }

  revalidatePath("/todos");
  revalidatePath("/todos/[areaId]", "page");
  return {};
}
