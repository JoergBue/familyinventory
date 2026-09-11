import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/require-session";

export default async function ItemsPage() {
  await requireSession();

  const items = await prisma.item.findMany({
    include: {
      category: { select: { name: true } },
      owner: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-4xl p-4 sm:p-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Gegenstände</h1>
        <Link
          href="/items/new"
          className="shrink-0 rounded bg-gray-900 px-4 py-2.5 text-sm text-white"
        >
          + Neuer Gegenstand
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="text-gray-600">Noch keine Gegenstände erfasst.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={`/items/${item.id}`}
                className="flex items-center justify-between gap-3 rounded border border-gray-200 bg-white p-4 hover:border-gray-400"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{item.name}</p>
                  <p className="truncate text-sm text-gray-500">
                    {item.category.name} · {item.owner.name}
                    {item.location ? ` · ${item.location}` : ""}
                  </p>
                </div>
                {item.currentValue != null && (
                  <p className="shrink-0 text-sm font-medium text-gray-700">
                    {item.currentValue.toLocaleString("de-DE", {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
