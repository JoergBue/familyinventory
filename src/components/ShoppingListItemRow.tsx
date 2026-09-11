"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  toggleShoppingListItem,
  deleteShoppingListItem,
} from "@/app/shopping-list/actions";

type Item = {
  id: string;
  name: string;
  store: string | null;
  quantity: string | null;
  checked: boolean;
};

export function ShoppingListItemRow({ item }: { item: Item }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleToggle() {
    setError(null);
    startTransition(async () => {
      const result = await toggleShoppingListItem(item.id, !item.checked);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteShoppingListItem(item.id);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  const details = [item.quantity, item.store].filter(Boolean).join(" · ");

  return (
    <li className="flex items-center gap-3 rounded border border-gray-200 bg-white p-3">
      <button
        type="button"
        onClick={handleToggle}
        disabled={isPending}
        aria-label={
          item.checked ? "Als offen markieren" : "Als erledigt markieren"
        }
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 disabled:opacity-50 ${
          item.checked
            ? "border-gray-900 bg-gray-900"
            : "border-gray-300 bg-white"
        }`}
      >
        {item.checked && (
          <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
            <path
              d="M4 10.5 L8 14.5 L16 5.5"
              stroke="white"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      <div className="min-w-0 flex-1">
        <p
          className={`truncate ${
            item.checked ? "text-gray-400 line-through" : "text-gray-900"
          }`}
        >
          {item.name}
        </p>
        {details && (
          <p
            className={`truncate text-sm ${
              item.checked ? "text-gray-300" : "text-gray-500"
            }`}
          >
            {details}
          </p>
        )}
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>

      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        aria-label="Löschen"
        className="shrink-0 rounded p-2 text-gray-400 hover:text-red-600 disabled:opacity-50"
      >
        <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5">
          <path
            d="M5 5 L15 15 M15 5 L5 15"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </li>
  );
}
