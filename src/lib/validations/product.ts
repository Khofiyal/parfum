// src/lib/validations/product.ts
// Zod schemas untuk produk

import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2, "Nama produk minimal 2 karakter").max(200),
  slug: z
    .string()
    .min(2)
    .max(200)
    .regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan tanda hubung"),
  brand: z.string().min(1, "Brand wajib diisi").max(100),
  description: z.string().min(20, "Deskripsi minimal 20 karakter").max(5000),
  price: z
    .number()
    .positive("Harga harus lebih dari 0")
    .max(100_000_000, "Harga tidak valid"),
  stock: z.number().int().min(0, "Stok tidak boleh negatif").max(99_999),
  imageUrls: z.array(z.string().url()).min(1, "Minimal 1 foto produk").max(10),
  topNotes: z.array(z.string()).min(1).max(10),
  middleNotes: z.array(z.string()).min(1).max(10),
  baseNotes: z.array(z.string()).min(1).max(10),
  category: z.enum(["floral", "woody", "oriental", "fresh", "citrus", "gourmand", "chypre", "fougere", "aquatic"]),
  size: z.enum(["10ml", "15ml", "30ml", "50ml", "75ml", "100ml", "125ml", "150ml", "200ml"]),
  concentration: z.enum(["Parfum", "EDP", "EDT", "EDC", "Splash"]),
  gender: z.enum(["unisex", "masculine", "feminine"]),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

export const productFilterSchema = z.object({
  brand: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  size: z.string().optional(),
  concentration: z.string().optional(),
  gender: z.string().optional(),
  sortBy: z.enum(["price_asc", "price_desc", "newest", "popular"]).default("newest"),
  search: z.string().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(12),
});

export type ProductInput = z.infer<typeof productSchema>;
export type ProductFilter = z.infer<typeof productFilterSchema>;
