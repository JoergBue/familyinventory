import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/require-session";
import { ItemForm } from "@/components/ItemForm";
import { createItem } from "../actions";

export default async function NewItemPage() {
  await requireSession();

  const [categories, owners] = await Promise.all([
    prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Neuer Gegenstand</h1>
      <ItemForm categories={categories} owners={owners} action={createItem} />
    </main>
  );
}
