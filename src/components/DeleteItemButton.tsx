"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteItem } from "@/app/items/actions";

export function DeleteItemButton({ itemId }: { itemId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleDelete() {
    if (!confirm("Diesen Gegenstand wirklich löschen?")) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteItem(itemId);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push("/items");
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="rounded border border-red-300 px-3 py-1.5 text-sm text-red-600 disabled:opacity-50"
      >
        {isPending ? "Löschen..." : "Löschen"}
      </button>
      {error && <span className="text-sm text-red-600">{error}</span>}
    </div>
  );
}
