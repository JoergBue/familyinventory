import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/require-session";

// Jeder ToDo-Bereich hat jetzt seine eigene Liste unter /todos/[areaId] und
// einen eigenen Menüeintrag (siehe HeaderNav.tsx). Diese Seite dient nur
// noch als Einstieg, z.B. wenn jemand direkt auf /todos geht: sie listet
// die vorhandenen Bereiche zum Weiterklicken auf.
export default async function TodosIndexPage() {
  await requireSession();

  const areas = await prisma.todoArea.findMany({
    select: {
      id: true,
      name: true,
      _count: { select: { todos: { where: { done: false } } } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <main className="mx-auto max-w-2xl p-4 sm:p-6">
      <h1 className="mb-6 text-2xl font-bold">ToDos</h1>

      {areas.length === 0 ? (
        <p className="text-gray-600">
          Es gibt noch keinen ToDo-Bereich. Bitte zuerst unter{" "}
          <Link href="/todo-areas" className="underline">
            ToDo-Bereiche
          </Link>{" "}
          einen Bereich anlegen.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {areas.map((area) => (
            <li key={area.id}>
              <Link
                href={`/todos/${area.id}`}
                className="flex items-center justify-between rounded border border-gray-200 bg-white p-4 hover:border-gray-400"
              >
                <span className="font-medium">{area.name}</span>
                <span className="text-sm text-gray-500">
                  {area._count.todos} offen
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
