"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ActionState } from "@/app/items/actions";

const CONDITIONS = [
  "Neu",
  "Gebraucht - sehr gut",
  "Gebraucht - gut",
  "Gebraucht - ok",
  "Defekt",
];

function toDateInputValue(iso?: string | null) {
  if (!iso) return "";
  return iso.slice(0, 10);
}

export type ItemFormValues = {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  purchaseDate: string | null; // ISO-Datumsstring
  purchasePrice: number | null;
  currentValue: number | null;
  condition: string | null;
  manufacturer: string | null;
  orderNumber: string | null;
  serialNumber: string | null;
  notes: string | null;
  categoryId: string;
  ownerId: string;
};

const initialState: ActionState = {};

export function ItemForm({
  categories,
  owners,
  item,
  action,
}: {
  categories: { id: string; name: string }[];
  owners: { id: string; name: string }[];
  item?: ItemFormValues;
  action: (
    prevState: ActionState,
    formData: FormData,
  ) => Promise<ActionState>;
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    action,
    initialState,
  );

  // Absicherung: sollten categories/owners aus irgendeinem Grund (z.B. ein
  // kurzzeitiger Versions-Unterschied zwischen Client und Server direkt nach
  // einem Deployment) doch mal nicht als Array ankommen, lieber eine leere
  // Liste rendern als die ganze Seite mit einem Absturz zu blockieren.
  const safeCategories = categories ?? [];
  const safeOwners = owners ?? [];

  // Weiterleitung nach erfolgreichem Speichern passiert bewusst hier im
  // Client (statt per redirect() in der Server Action) - siehe Kommentar in
  // src/app/items/actions.ts.
  useEffect(() => {
    if (state.success && state.itemId) {
      router.push(`/items/${state.itemId}`);
    }
  }, [state.success, state.itemId, router]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state?.error && (
        <div className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="name">
          Name *
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={item?.name}
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="categoryId">
            Kategorie *
          </label>
          <select
            id="categoryId"
            name="categoryId"
            required
            defaultValue={item?.categoryId ?? ""}
            className="w-full rounded border border-gray-300 px-3 py-2"
          >
            <option value="" disabled>
              Bitte wählen
            </option>
            {safeCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="ownerId">
            Besitzer *
          </label>
          <select
            id="ownerId"
            name="ownerId"
            required
            defaultValue={item?.ownerId ?? ""}
            className="w-full rounded border border-gray-300 px-3 py-2"
          >
            <option value="" disabled>
              Bitte wählen
            </option>
            {safeOwners.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="description">
          Beschreibung
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={item?.description ?? ""}
          rows={3}
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="location">
            Standort/Raum
          </label>
          <input
            id="location"
            name="location"
            defaultValue={item?.location ?? ""}
            placeholder="z.B. Wohnzimmer, Keller, Boot"
            className="w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="condition">
            Zustand
          </label>
          <select
            id="condition"
            name="condition"
            defaultValue={item?.condition ?? ""}
            className="w-full rounded border border-gray-300 px-3 py-2"
          >
            <option value="">-</option>
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="purchaseDate">
            Kaufdatum
          </label>
          <input
            id="purchaseDate"
            name="purchaseDate"
            type="date"
            defaultValue={toDateInputValue(item?.purchaseDate)}
            className="w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="purchasePrice">
            Kaufpreis (€)
          </label>
          <input
            id="purchasePrice"
            name="purchasePrice"
            type="number"
            step="0.01"
            min="0"
            defaultValue={item?.purchasePrice ?? ""}
            className="w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="currentValue">
            Aktueller Wert (€)
          </label>
          <input
            id="currentValue"
            name="currentValue"
            type="number"
            step="0.01"
            min="0"
            defaultValue={item?.currentValue ?? ""}
            className="w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="manufacturer">
            Hersteller
          </label>
          <input
            id="manufacturer"
            name="manufacturer"
            defaultValue={item?.manufacturer ?? ""}
            className="w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="orderNumber">
            Bestellnummer
          </label>
          <input
            id="orderNumber"
            name="orderNumber"
            defaultValue={item?.orderNumber ?? ""}
            className="w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="serialNumber">
            Seriennummer
          </label>
          <input
            id="serialNumber"
            name="serialNumber"
            defaultValue={item?.serialNumber ?? ""}
            className="w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="notes">
          Notizen
        </label>
        <textarea
          id="notes"
          name="notes"
          defaultValue={item?.notes ?? ""}
          rows={3}
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-gray-900 px-4 py-2 text-white disabled:opacity-50"
      >
        {isPending ? "Speichert..." : "Speichern"}
      </button>
    </form>
  );
}
