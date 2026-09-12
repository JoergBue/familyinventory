"use client";

import Link from "next/link";
import { useActionState } from "react";
import { updateUser, type UserActionState } from "@/app/users/actions";
import { USER_ROLES, USER_ROLE_LABELS } from "@/lib/roles";

const initialState: UserActionState = {};

export function EditUserForm({
  user,
}: {
  user: { id: string; name: string; email: string; role: string };
}) {
  const [state, formAction, isPending] = useActionState(
    updateUser.bind(null, user.id),
    initialState,
  );

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded border border-gray-200 bg-white p-4"
    >
      {state?.error && (
        <div className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
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
          defaultValue={user.name}
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
          defaultValue={user.email}
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="role">
          Gruppe
        </label>
        <select
          id="role"
          name="role"
          required
          defaultValue={user.role}
          className="w-full rounded border border-gray-300 px-3 py-2"
        >
          {USER_ROLES.map((role) => (
            <option key={role} value={role}>
              {USER_ROLE_LABELS[role]}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="password">
            Neues Passwort
          </label>
          <input
            id="password"
            name="password"
            type="password"
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
            minLength={6}
            className="w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>
      </div>
      <p className="text-xs text-gray-500">
        Passwort nur ausfüllen, wenn es geändert werden soll.
      </p>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded bg-gray-900 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {isPending ? "Speichert..." : "Speichern"}
        </button>
        <Link href="/users" className="text-sm text-gray-600 hover:text-gray-900">
          Abbrechen
        </Link>
      </div>
    </form>
  );
}
