// src/lib/actions/products.ts
// Server Actions untuk produk (read operations)
// Semua data di-serialize sebelum dikembalikan ke Client Components

"use server";

import { prismaRO } from "@/lib/db/prisma";
import { productFilterSchema } from "@/lib/validations/product";
import { cachedGet } from "@/lib/cache/redis";
import { serializeProducts, serializeProduct } from "@/lib/db/serialize";
import type { PaginatedResponse } from "@/types";

// ─── Get products (catalog) ───────────────────────────────────────────────────
export async function getProducts(rawFilters: Record<string, string | undefined>) {
  const filters = productFilterSchema.parse(rawFilters);

  const where: Record<string, unknown> = {
    isActive: true,
    ...(filters.brand && { brand: { contains: filters.brand } }),
    ...(filters.category && { category: filters.category }),
    ...(filters.size && { size: filters.size }),
    ...(filters.concentration && { concentration: filters.concentration }),
    ...(filters.gender && { gender: filters.gender }),
    ...((filters.minPrice !== undefined || filters.maxPrice !== undefined) && {
      price: {
        ...(filters.minPrice !== undefined && { gte: filters.minPrice }),
        ...(filters.maxPrice !== undefined && { lte: filters.maxPrice }),
      },
    }),
    ...(filters.search && {
      OR: [
        { name: { contains: filters.search } },
        { brand: { contains: filters.search } },
        { description: { contains: filters.search } },
      ],
    }),
  };

  const orderBy: Record<string, string> =
    filters.sortBy === "price_asc"
      ? { price: "asc" }
      : filters.sortBy === "price_desc"
      ? { price: "desc" }
      : filters.sortBy === "popular"
      ? { orderItems: { _count: "desc" } }
      : { createdAt: "desc" };

  const skip = (filters.page - 1) * filters.limit;

  const [rawItems, total] = await Promise.all([
    prismaRO.product.findMany({
      where,
      orderBy,
      skip,
      take: filters.limit,
      include: {
        _count: { select: { reviews: true, orderItems: true } },
      },
    }),
    prismaRO.product.count({ where }),
  ]);

  const totalPages = Math.ceil(total / filters.limit);

  // Serialize Decimal → number sebelum return ke Client Component
  const items = serializeProducts(rawItems as Record<string, unknown>[]);

  return {
    items,
    total,
    page: filters.page,
    limit: filters.limit,
    totalPages,
    hasNextPage: filters.page < totalPages,
    hasPrevPage: filters.page > 1,
  } satisfies PaginatedResponse<(typeof items)[number]>;
}

// ─── Get single product by slug ───────────────────────────────────────────────
export async function getProductBySlug(slug: string) {
  const raw = await cachedGet(
    `product:slug:${slug}`,
    async () => {
      const product = await prismaRO.product.findUnique({
        where: { slug, isActive: true },
        include: {
          reviews: {
            where: { isVisible: true },
            orderBy: { createdAt: "desc" },
            take: 10,
            include: {
              user: { select: { id: true, name: true, image: true } },
            },
          },
          _count: { select: { reviews: true, orderItems: true } },
        },
      });
      return product;
    },
    300
  );

  if (!raw) return null;
  return serializeProduct(raw as Record<string, unknown>);
}

// ─── Get featured products ────────────────────────────────────────────────────
export async function getFeaturedProducts(limit = 4) {
  const raw = await cachedGet(
    `products:featured:${limit}`,
    async () => {
      return prismaRO.product.findMany({
        where: { isActive: true, isFeatured: true },
        orderBy: { createdAt: "desc" },
        take: limit,
        include: {
          _count: { select: { reviews: true, orderItems: true } },
        },
      });
    },
    600
  );

  return serializeProducts(raw as Record<string, unknown>[]);
}

// ─── Get filter options (brands, categories, dll) ─────────────────────────────
export async function getFilterOptions() {
  return cachedGet(
    "products:filter-options",
    async () => {
      const [brands, sizes, categories] = await Promise.all([
        prismaRO.product.findMany({
          where: { isActive: true },
          select: { brand: true },
          distinct: ["brand"],
          orderBy: { brand: "asc" },
        }),
        prismaRO.product.findMany({
          where: { isActive: true },
          select: { size: true },
          distinct: ["size"],
          orderBy: { size: "asc" },
        }),
        prismaRO.product.findMany({
          where: { isActive: true },
          select: { category: true },
          distinct: ["category"],
          orderBy: { category: "asc" },
        }),
      ]);
      return {
        brands: brands.map((b) => b.brand),
        sizes: sizes.map((s) => s.size),
        categories: categories.map((c) => c.category),
      };
    },
    1800
  );
}

// ─── Get related products ─────────────────────────────────────────────────────
export async function getRelatedProducts(productId: string, category: string, limit = 4) {
  const raw = await cachedGet(
    `products:related:${productId}:${limit}`,
    async () => {
      return prismaRO.product.findMany({
        where: {
          isActive: true,
          category,
          id: { not: productId },
        },
        take: limit,
        orderBy: { orderItems: { _count: "desc" } },
        include: {
          _count: { select: { reviews: true, orderItems: true } },
        },
      });
    },
    600
  );

  return serializeProducts(raw as Record<string, unknown>[]);
}
