import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/require-session";
import { UserForm } from "@/components/UserForm";
import { USER_ROLE_LABELS, isUserRole } from "@/lib/roles";

function formatLastLogin(date: Date | null) {
  if (!date) return "Noch nie angemeldet";
  return date.toLocaleString("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function UsersPage() {
  const session = await requireSession();
  const isAdmin = session.userRole === "ADMIN";

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      lastLoginAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <main className="mx-auto max-w-2xl p-4 sm:p-6">
      <h1 className="mb-6 text-2xl font-bold">Familienmitglieder</h1>

      <ul className="mb-6 flex flex-col gap-2">
        {users.map((u) => (
          <li
            key={u.id}
            className="flex items-center justify-between gap-3 rounded border border-gray-200 bg-white p-3 text-sm"
          >
            <div className="min-w-0">
              <p className="font-medium">{u.name}</p>
              <p className="text-gray-500">{u.email}</p>
              <p className="mt-1 text-xs text-gray-400">
                {isUserRole(u.role) ? USER_ROLE_LABELS[u.role] : u.role}
                {" · "}
                Letzte Anmeldung: {formatLastLogin(u.lastLoginAt)}
              </p>
            </div>
            {isAdmin && (
              <Link
                href={`/users/${u.id}/edit`}
                className="shrink-0 rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                Bearbeiten
              </Link>
            )}
          </li>
        ))}
      </ul>

      {isAdmin && <UserForm />}
    </main>
  );
}
