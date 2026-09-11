import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/require-session";
import { PhotoUploadForm } from "@/components/PhotoUploadForm";
import { DeleteItemButton } from "@/components/DeleteItemButton";

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession();
  const { id } = await params;

  const item = await prisma.item.findUnique({
    where: { id },
    include: {
      category: { select: { name: true } },
      owner: { select: { name: true } },
      photos: true,
    },
  });

  if (!item) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/items" className="text-sm text-gray-500 hover:underline">
          ← Zurück zur Übersicht
        </Link>
        <div className="flex gap-2">
          <Link
            href={`/items/${item.id}/edit`}
            className="rounded border border-gray-300 px-3 py-1.5 text-sm"
          >
            Bearbeiten
          </Link>
          <DeleteItemButton itemId={item.id} />
        </div>
      </div>

      <h1 className="text-2xl font-bold">{item.name}</h1>
      <p className="mb-4 text-gray-500">
        {item.category.name} · {item.owner.name}
        {item.location ? ` · ${item.location}` : ""}
      </p>

      {item.description && <p className="mb-4">{item.description}</p>}

      <dl className="mb-6 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
        {item.purchaseDate && (
          <div>
            <dt className="text-gray-500">Kaufdatum</dt>
            <dd>{item.purchaseDate.toLocaleDateString("de-DE")}</dd>
          </div>
        )}
        {item.purchasePrice != null && (
          <div>
            <dt className="text-gray-500">Kaufpreis</dt>
            <dd>
              {item.purchasePrice.toLocaleString("de-DE", {
                style: "currency",
                currency: "EUR",
              })}
            </dd>
          </div>
        )}
        {item.currentValue != null && (
          <div>
            <dt className="text-gray-500">Aktueller Wert</dt>
            <dd>
              {item.currentValue.toLocaleString("de-DE", {
                style: "currency",
                currency: "EUR",
              })}
            </dd>
          </div>
        )}
        {item.condition && (
          <div>
            <dt className="text-gray-500">Zustand</dt>
            <dd>{item.condition}</dd>
          </div>
        )}
        {item.manufacturer && (
          <div>
            <dt className="text-gray-500">Hersteller</dt>
            <dd>{item.manufacturer}</dd>
          </div>
        )}
        {item.orderNumber && (
          <div>
            <dt className="text-gray-500">Bestellnummer</dt>
            <dd>{item.orderNumber}</dd>
          </div>
        )}
        {item.serialNumber && (
          <div>
            <dt className="text-gray-500">Seriennummer</dt>
            <dd>{item.serialNumber}</dd>
          </div>
        )}
      </dl>

      {item.notes && (
        <div className="mb-6">
          <h2 className="mb-1 text-sm font-medium text-gray-500">Notizen</h2>
          <p className="whitespace-pre-wrap text-sm">{item.notes}</p>
        </div>
      )}

      <div>
        <h2 className="mb-2 text-sm font-medium text-gray-500">
          Fotos &amp; Belege
        </h2>
        {item.photos.length > 0 && (
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {item.photos.map((photo) => (
              <a key={photo.id} href={photo.url} target="_blank" rel="noreferrer">
                <Image
                  src={photo.url}
                  alt=""
                  width={200}
                  height={200}
                  className="h-32 w-full rounded object-cover"
                />
              </a>
            ))}
          </div>
        )}
        <PhotoUploadForm itemId={item.id} />
      </div>
    </main>
  );
}
