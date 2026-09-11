import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/require-session";
import { ShoppingListAddForm } from "@/components/ShoppingListAddForm";
import { ShoppingListItemRow } from "@/components/ShoppingListItemRow";

export default async function ShoppingListPage() {
  await requireSession();

  const items = await prisma.shoppingListItem.findMany({
    orderBy: [{ checked: "asc" }, { createdAt: "desc" }],
  });

  return (
    <main className="mx-auto max-w-2xl p-4 sm:p-6">
      <h1 className="mb-6 text-2xl font-bold">Einkaufsliste</h1>

      <ShoppingListAddForm />

      {items.length === 0 ? (
        <p className="mt-6 text-gray-500">Die Einkaufsliste ist leer.</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-2">
          {items.map((item) => (
            <ShoppingListItemRow key={item.id} item={item} />
          ))}
        </ul>
      )}
    </main>
  );
}
