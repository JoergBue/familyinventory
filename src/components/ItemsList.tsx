"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

export type ItemListEntry = {
  id: string;
  name: string;
  location: string | null;
  currentValue: number | null;
  category: { name: string };
  owner: { name: string };
};

export function ItemsList({ items }: { items: ItemListEntry[] }) {
  const [query, setQuery] = useState("");
  const safeItems = items ?? [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return safeItems;
    return safeItems.filter((item) => {
      const haystack = [
        item.name,
        item.category.name,
        item.owner.name,
        item.location ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [safeItems, query]);

  return (
    <>
      <div className="mb-4">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Suche nach Name, Kategorie, Eigentümer oder Ort..."
          className="w-full rounded border border-gray-300 px-3 py-2.5"
        />
      </div>

      {safeItems.length === 0 ? (
        <p className="text-gray-600">Noch keine Gegenstände erfasst.</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-600">
          Keine Gegenstände gefunden. Suchbegriff anpassen?
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {filtered.map((item) => (
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
    </>
  );
}
