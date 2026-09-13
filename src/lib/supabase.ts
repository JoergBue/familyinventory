import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
  throw new Error(
    "SUPABASE_URL und SUPABASE_SECRET_KEY müssen in der .env gesetzt sein.",
  );
}

// Admin-Client mit dem Secret Key (Nachfolger des alten service_role-Keys):
// läuft NUR serverseitig (API-Routen / Server Actions), umgeht Row-Level-
// Security und darf niemals ans Frontend gelangen.
export const supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey, {
  auth: { persistSession: false },
});

// Name des Storage-Buckets für Foto-/Belegdateien zu Gegenständen.
// Muss im Supabase-Dashboard unter Storage als "Public bucket" angelegt sein.
export const PHOTOS_BUCKET = "item-photos";

/**
 * Baut aus einer Item-ID und einem Dateinamen den Objekt-Pfad im Bucket.
 */
export function buildPhotoStoragePath(itemId: string, filename: string) {
  return `${itemId}/${filename}`;
}

/**
 * Ermittelt aus einer öffentlichen Supabase-Storage-URL wieder den
 * Objekt-Pfad im Bucket (für das spätere Löschen). Gibt null zurück, wenn
 * die URL nicht wie erwartet aufgebaut ist (z.B. noch alte lokale Pfade).
 */
export function photoUrlToStoragePath(url: string): string | null {
  const marker = `/storage/v1/object/public/${PHOTOS_BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length);
}

// Name des Storage-Buckets für Profilbilder. Muss im Supabase-Dashboard
// unter Storage GENAUSO NEU angelegt werden wie item-photos (als "Public
// bucket") - ist ein eigener Bucket, damit Profilbilder unabhängig von den
// Gegenstands-Fotos verwaltet werden können.
export const AVATARS_BUCKET = "avatars";

export function buildAvatarStoragePath(userId: string, filename: string) {
  return `${userId}/${filename}`;
}

export function avatarUrlToStoragePath(url: string): string | null {
  const marker = `/storage/v1/object/public/${AVATARS_BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length);
}
