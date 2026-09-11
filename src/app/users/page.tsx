import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/require-session";
import { UserForm } from "@/components/UserForm";

export default async function UsersPage() {
  await requireSession();

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <main className="mx-auto max-w-2xl p-4 sm:p-6">
      <h1 className="mb-6 text-2xl font-bold">Familienmitglieder</h1>

      <ul className="mb-6 flex flex-col gap-2">
        {users.map((u) => (
          <li
            key={u.id}
            className="rounded border border-gray-200 bg-white p-3 text-sm"
          >
            <p className="font-medium">{u.name}</p>
            <p className="text-gray-500">{u.email}</p>
          </li>
        ))}
      </ul>

      <UserForm />
    </main>
  );
}
