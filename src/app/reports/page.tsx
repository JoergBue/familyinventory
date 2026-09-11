import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/require-session";
import { buildItemWhere, itemValue } from "@/lib/reports";

function formatEUR(n: number) {
  return n.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
}

function SummaryTable({
  title,
  rows,
}: {
  title: string;
  rows: { name: string; count: number; total: number }[];
}) {
  const sorted = [...rows].sort((a, b) => b.total - a.total);
  return (
    <div className="rounded border border-gray-200 bg-white p-4">
      <h2 className="mb-2 text-sm font-medium text-gray-500">{title}</h2>
      {sorted.length === 0 ? (
        <p className="text-sm text-gray-400">-</p>
      ) : (
        <ul className="flex flex-col gap-1 text-sm">
          {sorted.map((row) => (
            <li key={row.name} className="flex justify-between gap-2">
              <span className="truncate">
                {row.name} ({row.count})
              </span>
              <span className="shrink-0 font-medium">
                {formatEUR(row.total)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default async function ReportsPage({
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

  const [items, categories, owners] = await Promise.all([
    prisma.item.findMany({
      where: buildItemWhere({ categoryId, ownerId, location }),
      include: {
        category: { select: { name: true } },
        owner: { select: { name: true } },
      },
      orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
    }),
    prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const totalValue = items.reduce((sum, item) => sum + itemValue(item), 0);

  const byCategory = new Map<
    string,
    { name: string; count: number; total: number }
  >();
  const byOwner = new Map<
    string,
    { name: string; count: number; total: number }
  >();
  const byLocation = new Map<
    string,
    { name: string; count: number; total: number }
  >();

  for (const item of items) {
    const value = itemValue(item);

    const cat = byCategory.get(item.categoryId) ?? {
      name: item.category.name,
      count: 0,
      total: 0,
    };
    cat.count += 1;
    cat.total += value;
    byCategory.set(item.categoryId, cat);

    const own = byOwner.get(item.ownerId) ?? {
      name: item.owner.name,
      count: 0,
      total: 0,
    };
    own.count += 1;
    own.total += value;
    byOwner.set(item.ownerId, own);

    const locKey = item.location?.trim() || "Ohne Angabe";
    const loc = byLocation.get(locKey) ?? {
      name: locKey,
      count: 0,
      total: 0,
    };
    loc.count += 1;
    loc.total += value;
    byLocation.set(locKey, loc);
  }

  const qs = new URLSearchParams();
  if (categoryId) qs.set("categoryId", categoryId);
  if (ownerId) qs.set("ownerId", ownerId);
  if (location) qs.set("location", location);
  const qsString = qs.toString();

  return (
    <main className="mx-auto max-w-4xl p-4 sm:p-6">
      <h1 className="mb-6 text-2xl font-bold">Auswertungen</h1>

      <form
        method="get"
        className="mb-6 flex flex-wrap items-end gap-3 rounded border border-gray-200 bg-white p-4"
      >
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="categoryId">
            Kategorie
          </label>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={categoryId ?? ""}
            className="rounded border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">Alle</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="ownerId">
            Besitzer
          </label>
          <select
            id="ownerId"
            name="ownerId"
            defaultValue={ownerId ?? ""}
            className="rounded border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">Alle</option>
            {owners.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="location">
            Standort enthält
          </label>
          <input
            id="location"
            name="location"
            defaultValue={location ?? ""}
            className="rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="rounded bg-gray-900 px-4 py-2 text-sm text-white"
        >
          Filtern
        </button>
        {(categoryId || ownerId || location) && (
          <Link
            href="/reports"
            className="text-sm text-gray-500 hover:underline"
          >
            Zurücksetzen
          </Link>
        )}
      </form>

      <div className="mb-6 flex flex-wrap gap-3">
        <a
          href={`/api/reports/export${qsString ? `?${qsString}` : ""}`}
          className="rounded border border-gray-300 px-4 py-2 text-sm"
        >
          CSV exportieren (Excel)
        </a>
        <Link
          href={`/reports/print${qsString ? `?${qsString}` : ""}`}
          className="rounded border border-gray-300 px-4 py-2 text-sm"
        >
          Druckansicht / PDF
        </Link>
      </div>

      <div className="mb-6 rounded border border-gray-200 bg-white p-4">
        <p className="text-sm text-gray-500">
          Gesamtwert ({items.length} Gegenstände)
        </p>
        <p className="text-2xl font-bold">{formatEUR(totalValue)}</p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryTable title="Nach Kategorie" rows={[...byCategory.values()]} />
        <SummaryTable title="Nach Besitzer" rows={[...byOwner.values()]} />
        <SummaryTable title="Nach Standort" rows={[...byLocation.values()]} />
      </div>

      <div className="overflow-x-auto rounded border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 text-gray-500">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Kategorie</th>
              <th className="p-3">Besitzer</th>
              <th className="p-3">Standort</th>
              <th className="p-3 text-right">Wert</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-gray-100 last:border-0">
                <td className="p-3">
                  <Link href={`/items/${item.id}`} className="hover:underline">
                    {item.name}
                  </Link>
                </td>
                <td className="p-3">{item.category.name}</td>
                <td className="p-3">{item.owner.name}</td>
                <td className="p-3">{item.location ?? "-"}</td>
                <td className="p-3 text-right">{formatEUR(itemValue(item))}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="p-3 text-center text-gray-500">
                  Keine Gegenstände gefunden.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
