import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { HeaderNav } from "@/components/HeaderNav";
import { UserAvatar } from "@/components/UserAvatar";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "MyFamily",
  description: "Verwaltung persönlicher Gegenstände für die ganze Familie",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MyFamily",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#111827",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  // Avatar des angemeldeten Nutzers (für die Kopfzeile) und die aktuellen
  // ToDo-Bereiche (für die daraus generierten Menüeinträge) - beide nur
  // laden, wenn überhaupt jemand angemeldet ist. Wird per revalidatePath in
  // den jeweiligen Actions/Routen aktuell gehalten (Avatar-Upload,
  // Bereich anlegen/löschen), damit Änderungen ohne Neu-Login sichtbar sind.
  let avatarUrl: string | null = null;
  let todoAreas: { id: string; name: string }[] = [];

  if (session.isLoggedIn) {
    const [currentUser, areas] = await Promise.all([
      session.userId
        ? prisma.user.findUnique({
            where: { id: session.userId },
            select: { avatarUrl: true },
          })
        : null,
      prisma.todoArea.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
    ]);
    avatarUrl = currentUser?.avatarUrl ?? null;
    todoAreas = areas ?? [];
  }

  return (
    <html lang="de">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <ServiceWorkerRegister />
        {session.isLoggedIn && (
          <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 print:hidden">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <UserAvatar name={session.userName} avatarUrl={avatarUrl} size={32} />
              <span>MyFamily</span>
            </Link>
            <HeaderNav todoAreas={todoAreas} />
          </header>
        )}
        {children}
      </body>
    </html>
  );
}
