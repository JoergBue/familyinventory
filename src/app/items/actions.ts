"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/require-session";
import { revalidatePath } from "next/cache";
import {
  supabaseAdmin,
  PHOTOS_BUCKET,
  photoUrlToStoragePath,
} from "@/lib/supabase";

// Kein server-seitiges redirect() mehr nach dem Speichern (siehe
// createItem/updateItem unten) - die Weiterleitung übernimmt stattdessen
// die aufrufende Komponente per router.push(), sobald "success" + "itemId"
// zurückkommen. Grund: Auf manchen Hosting-Umgebungen (z.B. hinter einem
// Reverse Proxy) kann die spezielle Streaming-Antwort, die Next.js für ein
// redirect() innerhalb einer Server Action verwendet, zu einem
// Client-seitigen Absturz führen ("Cannot read properties of undefined
// (reading 'map')" in einem Next.js-internen Chunk). Löschen/Einkaufsliste
// nutzen bereits dieses robustere Muster.
export type ActionState = { error?: string; success?: boolean; itemId?: string };

function str(value: FormDataEntryValue | null): string | null {
  if (!value || typeof value !== "string" || value.trim() === "") return null;
  return value.trim();
}

function parseOptionalFloat(value: FormDataEntryValue | null): number | null {
  if (!value || typeof value !== "string" || value.trim() === "") return null;
  const n = Number(value.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function parseOptionalDate(value: FormDataEntryValue | null): Date | null {
  if (!value || typeof value !== "string" || value.trim() === "") return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function buildData(formData: FormData) {
  const name = str(formData.get("name"));
  if (!name) {
    throw new Error("Name ist erforderlich.");
  }
  const categoryId = formData.get("categoryId");
  const ownerId = formData.get("ownerId");
  if (typeof categoryId !== "string" || !categoryId) {
    throw new Error("Kategorie ist erforderlich.");
  }
  if (typeof ownerId !== "string" || !ownerId) {
    throw new Error("Besitzer ist erforderlich.");
  }

  return {
    name,
    description: str(formData.get("description")),
    location: str(formData.get("location")),
    purchaseDate: parseOptionalDate(formData.get("purchaseDate")),
    purchasePrice: parseOptionalFloat(formData.get("purchasePrice")),
    currentValue: parseOptionalFloat(formData.get("currentValue")),
    condition: str(formData.get("condition")),
    manufacturer: str(formData.get("manufacturer")),
    orderNumber: str(formData.get("orderNumber")),
    serialNumber: str(formData.get("serialNumber")),
    notes: str(formData.get("notes")),
    categoryId,
    ownerId,
  };
}

export async function createItem(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireSession();

  try {
    const data = buildData(formData);
    const item = await prisma.item.create({ data });
    revalidatePath("/items");
    return { success: true, itemId: item.id };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Der Gegenstand konnte nicht gespeichert werden.",
    };
  }
}

export async function updateItem(
  itemId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireSession();

  try {
    const data = buildData(formData);
    await prisma.item.update({ where: { id: itemId }, data });
    revalidatePath("/items");
    revalidatePath(`/items/${itemId}`);
    return { success: true, itemId };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Der Gegenstand konnte nicht gespeichert werden.",
    };
  }
}

export async function deleteItem(itemId: string): Promise<ActionState> {
  await requireSession();

  let storagePaths: string[] = [];
  try {
    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: { photos: true },
    });
    storagePaths = (item?.photos ?? [])
      .map((photo) => photoUrlToStoragePath(photo.url))
      .filter((p): p is string => p !== null);

    await prisma.item.delete({ where: { id: itemId } });
  } catch {
    return { error: "Der Gegenstand konnte nicht gelöscht werden." };
  }

  if (storagePaths.length > 0) {
    // Best-effort: schlägt das Aufräumen im Storage fehl, ist der
    // Gegenstand trotzdem gelöscht - verwaiste Dateien sind unkritisch.
    await supabaseAdmin.storage.from(PHOTOS_BUCKET).remove(storagePaths).catch(() => {});
  }

  revalidatePath("/items");
  return {};
}
