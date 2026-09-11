import type { Prisma } from "@prisma/client";

export interface ReportFilters {
  categoryId?: string;
  ownerId?: string;
  location?: string;
}

export function buildItemWhere(filters: ReportFilters): Prisma.ItemWhereInput {
  const where: Prisma.ItemWhereInput = {};
  if (filters.categoryId) where.categoryId = filters.categoryId;
  if (filters.ownerId) where.ownerId = filters.ownerId;
  if (filters.location) where.location = { contains: filters.location };
  return where;
}

export function itemValue(item: {
  currentValue: number | null;
  purchasePrice: number | null;
}): number {
  return item.currentValue ?? item.purchasePrice ?? 0;
}

export function parseFiltersFromSearchParams(
  sp: URLSearchParams,
): ReportFilters {
  return {
    categoryId: sp.get("categoryId") ?? undefined,
    ownerId: sp.get("ownerId") ?? undefined,
    location: sp.get("location") ?? undefined,
  };
}
