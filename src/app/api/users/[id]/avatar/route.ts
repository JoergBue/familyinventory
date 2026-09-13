import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import {
  supabaseAdmin,
  AVATARS_BUCKET,
  buildAvatarStoragePath,
  avatarUrlToStoragePath,
} from "@/lib/supabase";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  }
  // Nur Admins dürfen Profilbilder hochladen (für sich selbst und für
  // andere Familienmitglieder) - siehe requireAdmin() für den gleichen
  // Grundsatz bei der übrigen Benutzerverwaltung.
  if (session.userRole !== "ADMIN") {
    return NextResponse.json(
      { error: "Nur Admins dürfen Profilbilder hochladen." },
      { status: 403 },
    );
  }

  const { id: userId } = await params;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json(
      { error: "Familienmitglied nicht gefunden" },
      { status: 404 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Keine Datei erhalten" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "Nur Bilddateien erlaubt" },
      { status: 400 },
    );
  }

  const maxSizeBytes = 5 * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return NextResponse.json(
      { error: "Datei zu groß (max. 5 MB)" },
      { status: 400 },
    );
  }

  const extension = path.extname(file.name) || ".jpg";
  const filename = `${randomUUID()}${extension}`;
  const storagePath = buildAvatarStoragePath(userId, filename);

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabaseAdmin.storage
    .from(AVATARS_BUCKET)
    .upload(storagePath, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json(
      { error: "Profilbild konnte nicht hochgeladen werden." },
      { status: 500 },
    );
  }

  const { data: publicUrlData } = supabaseAdmin.storage
    .from(AVATARS_BUCKET)
    .getPublicUrl(storagePath);

  const previousAvatarUrl = user.avatarUrl;

  await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl: publicUrlData.publicUrl },
  });

  if (previousAvatarUrl) {
    const previousPath = avatarUrlToStoragePath(previousAvatarUrl);
    if (previousPath) {
      // Best-effort: altes Profilbild aufräumen. Schlägt das fehl, bleibt
      // nur eine verwaiste Datei im Storage zurück - unkritisch.
      await supabaseAdmin.storage
        .from(AVATARS_BUCKET)
        .remove([previousPath])
        .catch(() => {});
    }
  }

  // Betrifft die Kopfzeile (Root-Layout) auf jeder Seite sowie die
  // Familienmitglieder-Liste.
  revalidatePath("/", "layout");
  revalidatePath("/users");

  return NextResponse.json({ ok: true, avatarUrl: publicUrlData.publicUrl });
}
