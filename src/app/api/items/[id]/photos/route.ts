import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import {
  supabaseAdmin,
  PHOTOS_BUCKET,
  buildPhotoStoragePath,
} from "@/lib/supabase";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  }

  const { id: itemId } = await params;

  const item = await prisma.item.findUnique({ where: { id: itemId } });
  if (!item) {
    return NextResponse.json(
      { error: "Gegenstand nicht gefunden" },
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

  const maxSizeBytes = 15 * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return NextResponse.json(
      { error: "Datei zu groß (max. 15 MB)" },
      { status: 400 },
    );
  }

  const extension = path.extname(file.name) || ".jpg";
  const filename = `${randomUUID()}${extension}`;
  const storagePath = buildPhotoStoragePath(itemId, filename);

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabaseAdmin.storage
    .from(PHOTOS_BUCKET)
    .upload(storagePath, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json(
      { error: "Foto konnte nicht hochgeladen werden." },
      { status: 500 },
    );
  }

  const { data: publicUrlData } = supabaseAdmin.storage
    .from(PHOTOS_BUCKET)
    .getPublicUrl(storagePath);

  const photo = await prisma.photo.create({
    data: {
      itemId,
      url: publicUrlData.publicUrl,
      type: "PHOTO",
    },
  });

  return NextResponse.json({ ok: true, photo });
}
