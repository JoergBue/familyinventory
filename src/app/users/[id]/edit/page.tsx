import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-session";
import { EditUserForm } from "@/components/EditUserForm";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true },
  });

  if (!user) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-md p-4 sm:p-6">
      <h1 className="mb-6 text-2xl font-bold">Familienmitglied bearbeiten</h1>
      <EditUserForm user={user} />
    </main>
  );
}
