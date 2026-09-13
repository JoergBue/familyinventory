"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/require-session";
import { revalidatePath } from "next/cache";

export type TodoAreaActionState = { error?: string; success?: boolean };

export async function createTodoArea(
  _prevState: TodoAreaActionState,
  formData: FormData,
): Promise<TodoAreaActionState> {
  await requireSession();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return { error: "Name ist erforderlich." };
  }

  const existing = await prisma.todoArea.findUnique({ where: { name } });
  if (existing) {
    return { error: "Diesen Bereich gibt es schon." };
  }

  try {
    await prisma.todoArea.create({ data: { name } });
  } catch {
    return { error: "Bereich konnte nicht angelegt werden." };
  }

  revalidatePath("/todo-areas");
  revalidatePath("/todos");
  // Neuer Bereich => neuer Menüeintrag in der Kopfzeile (Root-Layout).
  revalidatePath("/", "layout");
  return { success: true };
}

export async function deleteTodoArea(
  areaId: string,
): Promise<{ error?: string }> {
  await requireSession();

  const todoCount = await prisma.todo.count({ where: { areaId } });
  if (todoCount > 0) {
    return {
      error: `Dieser Bereich wird noch von ${todoCount} ToDo(s) verwendet und kann nicht gelöscht werden.`,
    };
  }

  try {
    await prisma.todoArea.delete({ where: { id: areaId } });
  } catch {
    return { error: "Bereich konnte nicht gelöscht werden." };
  }

  revalidatePath("/todo-areas");
  revalidatePath("/todos");
  // Gelöschter Bereich => Menüeintrag in der Kopfzeile (Root-Layout) muss
  // verschwinden.
  revalidatePath("/", "layout");
  return {};
}
