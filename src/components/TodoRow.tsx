"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleTodo, deleteTodo } from "@/app/todos/actions";

export type TodoEntry = {
  id: string;
  title: string;
  assignedTo: string;
  dueDate: string | null; // ISO-Datumsstring
  done: boolean;
};

function formatDueDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("de-DE", { dateStyle: "medium" });
}

export function TodoRow({ todo }: { todo: TodoEntry }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleToggle() {
    setError(null);
    startTransition(async () => {
      const result = await toggleTodo(todo.id, !todo.done);
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
      const result = await deleteTodo(todo.id);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  const dueLabel = formatDueDate(todo.dueDate);
  const isOverdue =
    !todo.done &&
    todo.dueDate !== null &&
    new Date(todo.dueDate).getTime() < Date.now();

  return (
    <li className="flex items-center gap-3 rounded border border-gray-200 bg-white p-3">
      <button
        type="button"
        onClick={handleToggle}
        disabled={isPending}
        aria-label={
          todo.done ? "Als offen markieren" : "Als erledigt markieren"
        }
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 disabled:opacity-50 ${
          todo.done ? "border-gray-900 bg-gray-900" : "border-gray-300 bg-white"
        }`}
      >
        {todo.done && (
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
            todo.done ? "text-gray-400 line-through" : "text-gray-900"
          }`}
        >
          {todo.title}
        </p>
        <p
          className={`truncate text-sm ${
            todo.done ? "text-gray-300" : "text-gray-500"
          }`}
        >
          {todo.assignedTo}
          {dueLabel && (
            <>
              {" · "}
              <span className={isOverdue ? "font-medium text-red-600" : ""}>
                Fertig bis {dueLabel}
              </span>
            </>
          )}
        </p>
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
