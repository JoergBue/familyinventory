"use client";

import Link from "next/link";
import { useState } from "react";
import { LogoutButton } from "./LogoutButton";

type NavLink = { href: string; label: string };
type TodoAreaLink = { id: string; name: string };

const ITEMS_BEFORE = [
  { href: "/items", label: "Gegenstände" },
  { href: "/shopping-list", label: "Einkaufsliste" },
];

const ITEMS_AFTER = [{ href: "/reports", label: "Auswertungen" }];

// "Stammdaten" bündelt die selten geänderten Verwaltungsseiten, um die
// Menüebene übersichtlicher zu halten (statt einzelner Top-Level-Einträge).
const STAMMDATEN_ITEMS: NavLink[] = [
  { href: "/categories", label: "Kategorien" },
  { href: "/todo-areas", label: "ToDo Listen" },
  { href: "/users", label: "Familie" },
];

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
    >
      <path
        d="M5 7.5 L10 12.5 L15 7.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Desktop-Untermenü: Button mit Pfeil, öffnet ein Dropdown mit den Links.
function NavDropdown({
  label,
  items,
  open,
  onToggle,
  onClose,
}: {
  label: string;
  items: NavLink[];
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-haspopup="true"
        className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
      >
        {label}
        <ChevronIcon open={open} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={onClose} />
          <div className="absolute left-0 z-20 mt-2 w-48 rounded-lg border border-gray-200 bg-white py-2 shadow-xl">
            {items.length === 0 ? (
              <p className="px-4 py-2 text-sm text-gray-400">Keine Einträge</p>
            ) : (
              items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  {item.label}
                </Link>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Mobiler Abschnitt: Überschrift + eingerückte Links, immer sichtbar
// innerhalb des bereits geöffneten Hamburger-Menüs.
function MobileSection({
  label,
  items,
  onNavigate,
}: {
  label: string;
  items: NavLink[];
  onNavigate: () => void;
}) {
  return (
    <>
      <p className="mt-1 px-4 pt-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </p>
      {items.length === 0 ? (
        <p className="py-2 pl-7 pr-4 text-sm text-gray-400">
          Keine Einträge
        </p>
      ) : (
        items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className="block py-2 pl-7 pr-4 text-sm text-gray-700 hover:bg-gray-50"
          >
            {item.label}
          </Link>
        ))
      )}
    </>
  );
}

export function HeaderNav({ todoAreas }: { todoAreas: TodoAreaLink[] }) {
  const [open, setOpen] = useState(false); // mobiles Hamburger-Menü
  const [openMenu, setOpenMenu] = useState<"todo" | "stammdaten" | null>(null); // Desktop-Untermenüs

  // Die Einträge im "ToDo"-Untermenü generieren sich aus den unter
  // "ToDo Listen" (vormals "ToDo-Bereiche") angelegten Bereichen.
  const todoItems: NavLink[] = (todoAreas ?? []).map((area) => ({
    href: `/todos/${area.id}`,
    label: area.name,
  }));

  return (
    <>
      {/* Ab "sm" (Tablet/Desktop): normale horizontale Navigation */}
      <nav className="hidden flex-wrap items-center gap-4 sm:flex">
        {ITEMS_BEFORE.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            {item.label}
          </Link>
        ))}

        <NavDropdown
          label="ToDo"
          items={todoItems}
          open={openMenu === "todo"}
          onToggle={() => setOpenMenu((m) => (m === "todo" ? null : "todo"))}
          onClose={() => setOpenMenu(null)}
        />

        {ITEMS_AFTER.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            {item.label}
          </Link>
        ))}

        <NavDropdown
          label="Stammdaten"
          items={STAMMDATEN_ITEMS}
          open={openMenu === "stammdaten"}
          onToggle={() =>
            setOpenMenu((m) => (m === "stammdaten" ? null : "stammdaten"))
          }
          onClose={() => setOpenMenu(null)}
        />

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
              {ITEMS_BEFORE.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  {item.label}
                </Link>
              ))}

              <MobileSection
                label="ToDo"
                items={todoItems}
                onNavigate={() => setOpen(false)}
              />

              {ITEMS_AFTER.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  {item.label}
                </Link>
              ))}

              <MobileSection
                label="Stammdaten"
                items={STAMMDATEN_ITEMS}
                onNavigate={() => setOpen(false)}
              />

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
