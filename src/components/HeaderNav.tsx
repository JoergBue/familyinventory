"use client";

import Link from "next/link";
import { useState } from "react";
import { LogoutButton } from "./LogoutButton";

type TodoAreaLink = { id: string; name: string };

const ITEMS_BEFORE_TODOS = [
  { href: "/items", label: "Gegenstände" },
  { href: "/shopping-list", label: "Einkaufsliste" },
];

const ITEMS_AFTER_TODOS = [
  { href: "/reports", label: "Auswertungen" },
  { href: "/categories", label: "Kategorien" },
  { href: "/todo-areas", label: "ToDo-Bereiche" },
  { href: "/users", label: "Familie" },
];

export function HeaderNav({ todoAreas }: { todoAreas: TodoAreaLink[] }) {
  const [open, setOpen] = useState(false); // mobiles Hamburger-Menü
  const [todoOpen, setTodoOpen] = useState(false); // Desktop-Untermenü "ToDo"

  // Die Einträge im "ToDo"-Untermenü generieren sich aus den unter
  // "ToDo-Bereiche" angelegten Bereichen (siehe src/app/todo-areas).
  const areas = todoAreas ?? [];

  return (
    <>
      {/* Ab "sm" (Tablet/Desktop): normale horizontale Navigation */}
      <nav className="hidden flex-wrap items-center gap-4 sm:flex">
        {ITEMS_BEFORE_TODOS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            {item.label}
          </Link>
        ))}

        <div className="relative">
          <button
            type="button"
            onClick={() => setTodoOpen((v) => !v)}
            aria-expanded={todoOpen}
            aria-haspopup="true"
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
          >
            ToDo
            <svg
              viewBox="0 0 20 20"
              fill="none"
              className={`h-3 w-3 transition-transform ${
                todoOpen ? "rotate-180" : ""
              }`}
            >
              <path
                d="M5 7.5 L10 12.5 L15 7.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {todoOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setTodoOpen(false)}
              />
              <div className="absolute left-0 z-20 mt-2 w-48 rounded-lg border border-gray-200 bg-white py-2 shadow-xl">
                {areas.length === 0 ? (
                  <p className="px-4 py-2 text-sm text-gray-400">
                    Keine Bereiche
                  </p>
                ) : (
                  areas.map((area) => (
                    <Link
                      key={area.id}
                      href={`/todos/${area.id}`}
                      onClick={() => setTodoOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      {area.name}
                    </Link>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {ITEMS_AFTER_TODOS.map((item) => (
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
            <div className="absolute right-0 z-20 mt-2 w-56 max-h-[calc(100vh-4rem)] overflow-y-auto rounded-lg border border-gray-200 bg-white py-2 shadow-xl">
              {ITEMS_BEFORE_TODOS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  {item.label}
                </Link>
              ))}

              {/* "ToDo" als Untermenü: Überschrift + eingerückte Bereiche,
                  siehe gleiches Muster wie in der Desktop-Navigation. */}
              <p className="mt-1 px-4 pt-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                ToDo
              </p>
              {areas.length === 0 ? (
                <p className="py-2 pl-7 pr-4 text-sm text-gray-400">
                  Keine Bereiche angelegt
                </p>
              ) : (
                areas.map((area) => (
                  <Link
                    key={area.id}
                    href={`/todos/${area.id}`}
                    onClick={() => setOpen(false)}
                    className="block py-2 pl-7 pr-4 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    {area.name}
                  </Link>
                ))
              )}

              {ITEMS_AFTER_TODOS.map((item) => (
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
