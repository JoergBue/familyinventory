"use client";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="rounded bg-gray-900 px-4 py-2 text-sm text-white"
    >
      Drucken / Als PDF speichern
    </button>
  );
}
