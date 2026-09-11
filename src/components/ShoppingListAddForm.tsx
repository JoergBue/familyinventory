"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  addShoppingListItem,
  type ShoppingListActionState,
} from "@/app/shopping-list/actions";

const initialState: ShoppingListActionState = {};

export function ShoppingListAddForm() {
  const [state, formAction, isPending] = useActionState(
    addShoppingListItem,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      nameRef.current?.focus();
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
      <div className="flex gap-2">
        <input
          ref={nameRef}
          name="name"
          required
          placeholder="Was wird gebraucht?"
          autoFocus
          className="flex-1 rounded border border-gray-300 px-3 py-2.5 text-base"
        />
        <button
          type="submit"
          disabled={isPending}
          className="shrink-0 rounded bg-gray-900 px-4 py-2.5 text-sm text-white disabled:opacity-50"
        >
          {isPending ? "..." : "+ Hinzufügen"}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input
          name="quantity"
          placeholder="Menge (optional)"
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          name="store"
          placeholder="Einkaufsort (optional)"
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
    </form>
  );
}
