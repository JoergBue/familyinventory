import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/require-session";
import { ItemForm } from "@/components/ItemForm";
import { updateItem } from "../../actions";

export default async function EditItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession();
  const { id } = await params;

  const [item, categories, owners] = await Promise.all([
    prisma.item.findUnique({ where: { id } }),
    prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!item) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Gegenstand bearbeiten</h1>
      <ItemForm
        categories={categories}
        owners={owners}
        item={{
          ...item,
          purchaseDate: item.purchaseDate
            ? item.purchaseDate.toISOString()
            : null,
        }}
        action={updateItem.bind(null, item.id)}
      />
    </main>
  );
}
