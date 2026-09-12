import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/require-session";
import { TodoAreaForm } from "@/components/TodoAreaForm";
import { DeleteTodoAreaButton } from "@/components/DeleteTodoAreaButton";

export default async function TodoAreasPage() {
  await requireSession();

  const areas = await prisma.todoArea.findMany({
    select: { id: true, name: true, _count: { select: { todos: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <main className="mx-auto max-w-2xl p-4 sm:p-6">
      <h1 className="mb-6 text-2xl font-bold">ToDo-Bereiche</h1>

      <ul className="mb-6 flex flex-col gap-2">
        {areas.map((a) => (
          <li
            key={a.id}
            className="flex items-center justify-between rounded border border-gray-200 bg-white p-3 text-sm"
          >
            <span>
              {a.name}{" "}
              <span className="text-gray-400">({a._count.todos})</span>
            </span>
            <DeleteTodoAreaButton areaId={a.id} />
          </li>
        ))}
      </ul>

      <TodoAreaForm />
    </main>
  );
}
