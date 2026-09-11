"use client";

import { useActionState, useEffect, useRef } from "react";
import { createUser, type UserActionState } from "@/app/users/actions";

const initialState: UserActionState = {};

export function UserForm() {
  const [state, formAction, isPending] = useActionState(
    createUser,
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
      className="flex flex-col gap-3 rounded border border-gray-200 bg-white p-4"
    >
      <h2 className="text-sm font-medium text-gray-500">
        Neues Familienmitglied
      </h2>

      {state.error && (
        <div className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="rounded border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-700">
          Familienmitglied wurde angelegt.
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="name">
          Name
        </label>
        <input
          id="name"
          name="name"
          required
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="email">
          E-Mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="password">
            Passwort
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            className="w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>
        <div>
          <label
            className="mb-1 block text-sm font-medium"
            htmlFor="passwordConfirm"
          >
            Passwort wiederholen
          </label>
          <input
            id="passwordConfirm"
            name="passwordConfirm"
            type="password"
            required
            minLength={6}
            className="w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="self-start rounded bg-gray-900 px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {isPending ? "Anlegen..." : "Familienmitglied anlegen"}
      </button>
    </form>
  );
}
