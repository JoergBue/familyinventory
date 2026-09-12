"use client";

import Link from "next/link";
import { useState } from "react";
import { LogoutButton } from "./LogoutButton";

const NAV_ITEMS = [
  { href: "/items", label: "Gegenstände" },
  { href: "/shopping-list", label: "Einkaufsliste" },
  { href: "/todos", label: "ToDos" },
  { href: "/reports", label: "Auswertungen" },
  { href: "/categories", label: "Kategorien" },
  { href: "/todo-areas", label: "ToDo-Bereiche" },
  { href: "/users", label: "Familie" },
];

export function HeaderNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Ab "sm" (Tablet/Desktop): normale horizontale Navigation */}
      <nav className="hidden items-center gap-4 sm:flex">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            {item.label}
          </Link>
        ))}
        <LogoutButton />
      </nav>

      {/* Unterhalb "sm" (Handy): Hamburger-Button mit Dropdown */}
      <div className="relative sm:hidden">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Menü schließen" : "Menü öffnen"}
          aria-expanded={open}
          className="flex h-10 w-10 items-center justify-center rounded text-gray-600 hover:bg-gray-100"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="h-6 w-6"
          >
            {open ? (
              <path d="M6 6 L18 18 M18 6 L6 18" />
            ) : (
              <path d="M4 7 H20 M4 12 H20 M4 17 H20" />
            )}
          </svg>
        </button>

        {open && (
          <>
            {/* Unsichtbare Fläche zum Schließen bei Klick daneben */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setOpen(false)}
            />
            <div className="absolute right-0 z-20 mt-2 w-56 rounded-lg border border-gray-200 bg-white py-2 shadow-xl">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  {item.label}
                </Link>
              ))}
              <div className="mt-1 border-t border-gray-100 px-4 pt-2">
                <LogoutButton />
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
