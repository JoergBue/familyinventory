"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  createTodoArea,
  type TodoAreaActionState,
} from "@/app/todo-areas/actions";

const initialState: TodoAreaActionState = {};

export function TodoAreaForm() {
  const [state, formAction, isPending] = useActionState(
    createTodoArea,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-wrap items-end gap-3 rounded border border-gray-200 bg-white p-4"
    >
      <div className="flex-1">
        <label className="mb-1 block text-sm font-medium" htmlFor="name">
          Neuer Bereich
        </label>
        <input
          id="name"
          name="name"
          required
          placeholder="z.B. Garten"
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-gray-900 px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {isPending ? "Anlegen..." : "Hinzufügen"}
      </button>
      {state.error && (
        <p className="w-full text-sm text-red-600">{state.error}</p>
      )}
    </form>
  );
}
