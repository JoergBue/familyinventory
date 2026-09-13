"use client";

import { useMemo, useState } from "react";
import { TodoRow, type TodoEntry } from "./TodoRow";

export function TodoList({ todos }: { todos: TodoEntry[] }) {
  const [whoFilter, setWhoFilter] = useState("");

  // Absicherung: siehe gleiches Muster in ItemsList.tsx.
  const safeTodos = todos ?? [];

  const whoOptions = useMemo(() => {
    const names = new Set(safeTodos.map((t) => t.assignedTo));
    return Array.from(names).sort((a, b) => a.localeCompare(b, "de"));
  }, [safeTodos]);

  const filtered = useMemo(() => {
    if (!whoFilter) return safeTodos;
    return safeTodos.filter((t) => t.assignedTo === whoFilter);
  }, [safeTodos, whoFilter]);

  return (
    <>
      <div className="mb-4">
        <select
          value={whoFilter}
          onChange={(e) => setWhoFilter(e.target.value)}
          aria-label="Nach Wer filtern"
          className="w-full rounded border border-gray-300 px-3 py-2 sm:w-64"
        >
          <option value="">Alle (Wer)</option>
          {whoOptions.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {safeTodos.length === 0 ? (
        <p className="text-gray-600">Noch keine ToDos in diesem Bereich.</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-600">Keine ToDos gefunden. Filter anpassen?</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map((todo) => (
            <TodoRow key={todo.id} todo={todo} />
          ))}
        </ul>
      )}
    </>
  );
}
