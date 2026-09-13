import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/require-session";
import { TodoAddForm } from "@/components/TodoAddForm";
import { TodoList } from "@/components/TodoList";

export default async function TodoAreaPage({
  params,
}: {
  params: Promise<{ areaId: string }>;
}) {
  await requireSession();
  const { areaId } = await params;

  const area = await prisma.todoArea.findUnique({
    where: { id: areaId },
    select: { id: true, name: true },
  });

  if (!area) {
    notFound();
  }

  const [rawTodos, users] = await Promise.all([
    prisma.todo.findMany({
      where: { areaId },
      select: {
        id: true,
        title: true,
        assignedTo: true,
        dueDate: true,
        done: true,
      },
      orderBy: [{ done: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }],
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
      <h1 className="mb-6 text-2xl font-bold">ToDos: {area.name}</h1>

      <TodoAddForm
        areaId={area.id}
        suggestedNames={(users ?? []).map((u) => u.name)}
      />

      <div className="mt-6">
        <TodoList todos={todos} />
      </div>
    </main>
  );
}
