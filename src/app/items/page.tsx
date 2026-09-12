import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/require-session";
import { ItemsList } from "@/components/ItemsList";

export default async function ItemsPage() {
  await requireSession();

  const items = await prisma.item.findMany({
    select: {
      id: true,
      name: true,
      location: true,
      currentValue: true,
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

      <ItemsList items={items} />
    </main>
  );
}
