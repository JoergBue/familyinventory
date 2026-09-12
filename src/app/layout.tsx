import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import { getSession } from "@/lib/session";
import { HeaderNav } from "@/components/HeaderNav";
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

  return (
    <html lang="de">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <ServiceWorkerRegister />
        {session.isLoggedIn && (
          <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 print:hidden">
            <Link href="/" className="font-semibold">
              MyFamily
            </Link>
            <HeaderNav />
          </header>
        )}
        {children}
      </body>
    </html>
  );
}
