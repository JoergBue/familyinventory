import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/require-session";
import { TodoAddForm } from "@/components/TodoAddForm";
import { TodoList } from "@/components/TodoList";

export default async function TodosPage() {
  await requireSession();

  const [rawTodos, areas, users] = await Promise.all([
    prisma.todo.findMany({
      select: {
        id: true,
        title: true,
        assignedTo: true,
        dueDate: true,
        done: true,
        area: { select: { id: true, name: true } },
      },
      orderBy: [{ done: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }],
    }),
    prisma.todoArea.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({
      select: { name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  // Datum als ISO-String an die Client-Komponenten reichen, konsistent mit
  // dem Muster bei Gegenständen (siehe ItemForm/ItemsList).
  const todos = (rawTodos ?? []).map((t) => ({
    ...t,
    dueDate: t.dueDate ? t.dueDate.toISOString() : null,
  }));

  return (
    <main className="mx-auto max-w-2xl p-4 sm:p-6">
      <h1 className="mb-6 text-2xl font-bold">ToDos</h1>

      <TodoAddForm
        areas={areas ?? []}
        suggestedNames={(users ?? []).map((u) => u.name)}
      />

      <div className="mt-6">
        <TodoList todos={todos} areas={areas ?? []} />
      </div>
    </main>
  );
}
