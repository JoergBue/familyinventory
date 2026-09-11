import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { buildItemWhere, parseFiltersFromSearchParams } from "@/lib/reports";

function csvEscape(value: string): string {
  if (/[;"\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatNumber(n: number | null): string {
  if (n == null) return "";
  return n.toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(d: Date | null): string {
  if (!d) return "";
  return d.toLocaleDateString("de-DE");
}

export async function GET(request: Request) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  }

  const url = new URL(request.url);
  const filters = parseFiltersFromSearchParams(url.searchParams);
  const where = buildItemWhere(filters);

  const items = await prisma.item.findMany({
    where,
    include: {
      category: { select: { name: true } },
      owner: { select: { name: true } },
    },
    orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
  });

  const header = [
    "Name",
    "Kategorie",
    "Besitzer",
    "Standort",
    "Kaufdatum",
    "Kaufpreis",
    "Aktueller Wert",
    "Zustand",
    "Hersteller",
    "Bestellnummer",
    "Seriennummer",
    "Notizen",
  ];

  const rows = items.map((item) => [
    item.name,
    item.category.name,
    item.owner.name,
    item.location ?? "",
    formatDate(item.purchaseDate),
    formatNumber(item.purchasePrice),
    formatNumber(item.currentValue),
    item.condition ?? "",
    item.manufacturer ?? "",
    item.orderNumber ?? "",
    item.serialNumber ?? "",
    item.notes ?? "",
  ]);

  const lines = [header, ...rows].map((row) =>
    row.map((cell) => csvEscape(String(cell))).join(";"),
  );

  // UTF-8 BOM, damit Excel Umlaute korrekt anzeigt
  const csvContent = "﻿" + lines.join("\r\n") + "\r\n";
  const date = new Date().toISOString().slice(0, 10);

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="inventar-${date}.csv"`,
    },
  });
}
