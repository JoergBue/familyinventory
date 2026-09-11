import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/require-session";
import { CategoryForm } from "@/components/CategoryForm";
import { DeleteCategoryButton } from "@/components/DeleteCategoryButton";

export default async function CategoriesPage() {
  await requireSession();

  const categories = await prisma.category.findMany({
    select: { id: true, name: true, _count: { select: { items: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <main className="mx-auto max-w-2xl p-4 sm:p-6">
      <h1 className="mb-6 text-2xl font-bold">Kategorien</h1>

      <ul className="mb-6 flex flex-col gap-2">
        {categories.map((c) => (
          <li
            key={c.id}
            className="flex items-center justify-between rounded border border-gray-200 bg-white p-3 text-sm"
          >
            <span>
              {c.name}{" "}
              <span className="text-gray-400">({c._count.items})</span>
            </span>
            <DeleteCategoryButton categoryId={c.id} />
          </li>
        ))}
      </ul>

      <CategoryForm />
    </main>
  );
}
