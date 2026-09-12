"use client";

import { useMemo, useState } from "react";
import { TodoRow, type TodoEntry } from "./TodoRow";

export function TodoList({
  todos,
  areas,
}: {
  todos: TodoEntry[];
  areas: { id: string; name: string }[];
}) {
  const [whoFilter, setWhoFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState("");

  // Absicherung: siehe gleiches Muster in ItemsList.tsx.
  const safeTodos = todos ?? [];
  const safeAreas = areas ?? [];

  const whoOptions = useMemo(() => {
    const names = new Set(safeTodos.map((t) => t.assignedTo));
    return Array.from(names).sort((a, b) => a.localeCompare(b, "de"));
  }, [safeTodos]);

  const filtered = useMemo(() => {
    return safeTodos.filter((t) => {
      if (whoFilter && t.assignedTo !== whoFilter) return false;
      if (areaFilter && t.area.id !== areaFilter) return false;
      return true;
    });
  }, [safeTodos, whoFilter, areaFilter]);

  return (
    <>
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <select
          value={whoFilter}
          onChange={(e) => setWhoFilter(e.target.value)}
          aria-label="Nach Wer filtern"
          className="rounded border border-gray-300 px-3 py-2"
        >
          <option value="">Alle (Wer)</option>
          {whoOptions.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <select
          value={areaFilter}
          onChange={(e) => setAreaFilter(e.target.value)}
          aria-label="Nach Bereich filtern"
          className="rounded border border-gray-300 px-3 py-2"
        >
          <option value="">Alle (Bereich)</option>
          {safeAreas.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      {safeTodos.length === 0 ? (
        <p className="text-gray-600">Noch keine ToDos erfasst.</p>
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
