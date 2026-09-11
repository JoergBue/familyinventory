import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/require-session";
import { buildItemWhere, itemValue } from "@/lib/reports";
import { PrintButton } from "@/components/PrintButton";

function formatEUR(n: number) {
  return n.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
}

function formatDate(d: Date | null) {
  return d ? d.toLocaleDateString("de-DE") : "-";
}

export default async function ReportsPrintPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireSession();
  const sp = await searchParams;
  const categoryId =
    typeof sp.categoryId === "string" && sp.categoryId
      ? sp.categoryId
      : undefined;
  const ownerId =
    typeof sp.ownerId === "string" && sp.ownerId ? sp.ownerId : undefined;
  const location =
    typeof sp.location === "string" && sp.location ? sp.location : undefined;

  const [items, category, owner] = await Promise.all([
    prisma.item.findMany({
      where: buildItemWhere({ categoryId, ownerId, location }),
      include: {
        category: { select: { name: true } },
        owner: { select: { name: true } },
      },
      orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
    }),
    categoryId
      ? prisma.category.findUnique({
          where: { id: categoryId },
          select: { name: true },
        })
      : Promise.resolve(null),
    ownerId
      ? prisma.user.findUnique({
          where: { id: ownerId },
          select: { name: true },
        })
      : Promise.resolve(null),
  ]);

  const totalValue = items.reduce((sum, item) => sum + itemValue(item), 0);

  const filterParts: string[] = [];
  if (category) filterParts.push(`Kategorie: ${category.name}`);
  if (owner) filterParts.push(`Besitzer: ${owner.name}`);
  if (location) filterParts.push(`Standort enthält: "${location}"`);

  return (
    <main className="mx-auto max-w-4xl p-6 print:max-w-none print:p-0">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <p className="text-sm text-gray-500">
          Drucke diese Seite oder speichere sie über den Browser als PDF.
        </p>
        <PrintButton />
      </div>

      <h1 className="text-2xl font-bold">Inventarliste</h1>
      <p className="text-sm text-gray-500">
        Erstellt am {new Date().toLocaleDateString("de-DE")}
        {filterParts.length > 0 && ` · ${filterParts.join(" · ")}`}
      </p>

      <p className="mb-6 mt-4 text-lg font-semibold">
        Gesamtwert: {formatEUR(totalValue)} ({items.length} Gegenstände)
      </p>

      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-gray-400">
            <th className="py-2 pr-2">Name</th>
            <th className="py-2 pr-2">Kategorie</th>
            <th className="py-2 pr-2">Besitzer</th>
            <th className="py-2 pr-2">Standort</th>
            <th className="py-2 pr-2">Kaufdatum</th>
            <th className="py-2 pr-2 text-right">Kaufpreis</th>
            <th className="py-2 pr-2 text-right">Aktueller Wert</th>
            <th className="py-2 pr-2">Zustand</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-gray-200">
              <td className="py-2 pr-2">{item.name}</td>
              <td className="py-2 pr-2">{item.category.name}</td>
              <td className="py-2 pr-2">{item.owner.name}</td>
              <td className="py-2 pr-2">{item.location ?? "-"}</td>
              <td className="py-2 pr-2">{formatDate(item.purchaseDate)}</td>
              <td className="py-2 pr-2 text-right">
                {item.purchasePrice != null
                  ? formatEUR(item.purchasePrice)
                  : "-"}
              </td>
              <td className="py-2 pr-2 text-right">
                {item.currentValue != null
                  ? formatEUR(item.currentValue)
                  : "-"}
              </td>
              <td className="py-2 pr-2">{item.condition ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
