"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteTodoArea } from "@/app/todo-areas/actions";

export function DeleteTodoAreaButton({ areaId }: { areaId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleDelete() {
    if (!confirm("Diesen Bereich wirklich löschen?")) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteTodoArea(areaId);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="text-sm text-red-600 hover:underline disabled:opacity-50"
      >
        {isPending ? "..." : "Löschen"}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
