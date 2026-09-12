"use client";

import { useActionState, useEffect, useRef } from "react";
import { addTodo, type TodoActionState } from "@/app/todos/actions";

const initialState: TodoActionState = {};

export function TodoAddForm({
  areas,
  suggestedNames,
}: {
  areas: { id: string; name: string }[];
  suggestedNames: string[];
}) {
  const [state, formAction, isPending] = useActionState(
    addTodo,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  // Absicherung: siehe gleiches Muster in ItemForm.tsx.
  const safeAreas = areas ?? [];
  const safeNames = suggestedNames ?? [];

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      titleRef.current?.focus();
    }
  }, [state.success]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-3 rounded border border-gray-200 bg-white p-4"
    >
      {state.error && (
        <div className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="title">
          Was soll gemacht werden? *
        </label>
        <input
          ref={titleRef}
          id="title"
          name="title"
          required
          autoFocus
          placeholder="z.B. Rasen mähen"
          className="w-full rounded border border-gray-300 px-3 py-2.5 text-base"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label
            className="mb-1 block text-sm font-medium"
            htmlFor="assignedTo"
          >
            Wer? *
          </label>
          <input
            id="assignedTo"
            name="assignedTo"
            required
            list="todo-assignee-suggestions"
            placeholder="z.B. Jörg, Handwerker..."
            className="w-full rounded border border-gray-300 px-3 py-2"
          />
          {/* Vorschläge aus den Familienmitgliedern - die Eingabe ist aber
              nicht darauf beschränkt, es kann auch jeder andere Name/Text
              eingetragen werden (z.B. "Handwerker", "Nachbarin"). */}
          <datalist id="todo-assignee-suggestions">
            {safeNames.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="areaId">
            Bereich *
          </label>
          <select
            id="areaId"
            name="areaId"
            required
            defaultValue=""
            className="w-full rounded border border-gray-300 px-3 py-2"
          >
            <option value="" disabled>
              Bitte wählen
            </option>
            {safeAreas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="dueDate">
            Fertig bis
          </label>
          <input
            id="dueDate"
            name="dueDate"
            type="date"
            className="w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending || safeAreas.length === 0}
        className="self-start rounded bg-gray-900 px-4 py-2.5 text-sm text-white disabled:opacity-50"
      >
        {isPending ? "..." : "+ ToDo hinzufügen"}
      </button>
      {safeAreas.length === 0 && (
        <p className="text-xs text-gray-500">
          Bitte zuerst unter ToDo-Bereiche mindestens einen Bereich anlegen.
        </p>
      )}
    </form>
  );
}
