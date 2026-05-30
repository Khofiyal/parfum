// src/components/product/ProductCard.tsx
// Menerima data yang sudah di-serialize dari server (price selalu number)
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";

// Tipe serialized — price sudah number (bukan Prisma Decimal)
export interface SerializedProduct {
  id: string;
  name: string;
  slug: string;
  brand: string;
  description: string;
  price: number;
  stock: number;
  imageUrls: string[];
  topNotes: string[];
  middleNotes: string[];
  baseNotes: string[];
  category: string;
  size: string;
  concentration: string;
  gender: string;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { reviews: number; orderItems: number };
  avgRating?: number;
}

interface ProductCardProps {
  product: SerializedProduct;
  priority?: boolean;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Normalisasi URL gambar:
 * - Jika sudah absolute URL (http/https) → pakai langsung
 * - Jika path relatif tanpa leading slash (misal "public/x.jpg") → tambahkan "/"
 * - Jika kosong/null → return null (render placeholder)
 */
function normalizeImageUrl(url: string | undefined | null): string | null {
  if (!url) return null;
  // Sudah absolute URL
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  // Sudah ada leading slash
  if (url.startsWith("/")) return url;
  // Path relatif — strip "public/" prefix jika ada, lalu tambah "/"
  const cleaned = url.replace(/^public\//, "").replace(/^\//, "");
  return "/" + cleaned;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const imageUrls = product.imageUrls as string[];
  const primaryImage = normalizeImageUrl(imageUrls[0]) ?? null;
  const secondaryImage = normalizeImageUrl(imageUrls[1]) ?? primaryImage;
  const hasImage = primaryImage !== null;

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <article
        className="product-card"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ background: "var(--obsidian-900)" }}
      >
        {/* Image container */}
        <div className="relative overflow-hidden" style={{ aspectRatio: "3/4" }}>
          {hasImage ? (
            <>
              {/* Primary image */}
              <Image
                src={primaryImage!}
                alt={product.name}
                fill
                priority={priority}
                className="object-cover transition-all duration-700"
                style={{
                  transform: isHovered ? "scale(1.06)" : "scale(1)",
                  opacity: isHovered && secondaryImage !== primaryImage ? 0 : 1,
                }}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />

              {/* Secondary image on hover */}
              {secondaryImage && secondaryImage !== primaryImage && (
                <Image
                  src={secondaryImage}
                  alt={product.name}
                  fill
                  className="object-cover transition-all duration-700 absolute inset-0"
                  style={{
                    opacity: isHovered ? 1 : 0,
                    transform: isHovered ? "scale(1.06)" : "scale(1.1)",
                  }}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              )}
            </>
          ) : (
            /* Placeholder saat tidak ada foto */
            <div
              className="absolute inset-0 flex flex-col items-center justify-center"
              style={{ background: "var(--obsidian-800)" }}
            >
              <span
                className="font-display"
                style={{ fontSize: "3rem", color: "rgba(196,162,74,0.12)" }}
              >
                ✦
              </span>
              <p className="label mt-2" style={{ color: "var(--muted)", fontSize: "0.55rem" }}>
                Foto belum tersedia
              </p>
            </div>
          )}

          {/* Gradient overlay */}
          <div
            className="absolute inset-0 z-10"
            style={{
              background:
                "linear-gradient(to top, rgba(10,9,7,0.85) 0%, rgba(10,9,7,0.15) 55%, transparent 100%)",
            }}
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5">
            {product.isFeatured && <Badge variant="gold">Featured</Badge>}
            {product.stock <= 5 && product.stock > 0 && (
              <Badge variant="warning">Stok Terbatas</Badge>
            )}
            {product.stock === 0 && <Badge variant="error">Habis</Badge>}
          </div>

          {/* Size & concentration */}
          <div className="absolute bottom-3 left-3 z-20">
            <span className="label" style={{ color: "var(--muted-light)", fontSize: "0.58rem" }}>
              {product.size} · {product.concentration}
            </span>
          </div>

          {/* Quick add button */}
          <div className="product-card-overlay absolute bottom-3 right-3 z-20">
            <button
              onClick={(e) => {
                e.preventDefault();
                // handled by AddToCartButton on detail page
              }}
              className="label px-3 py-2 transition-all duration-200"
              style={{
                background: "var(--gold-600)",
                color: "var(--obsidian-950)",
                fontSize: "0.58rem",
              }}
              aria-label={`Tambah ${product.name} ke keranjang`}
            >
              + Keranjang
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="label mb-1" style={{ color: "var(--muted)", fontSize: "0.58rem" }}>
            {product.brand}
          </p>
          <h3
            className="font-display text-lg leading-tight mb-2"
            style={{ color: "var(--ivory-200)" }}
          >
            {product.name}
          </h3>
          <div className="flex items-center justify-between">
            <span className="font-display text-base" style={{ color: "var(--gold-400)" }}>
              {formatPrice(product.price)}
            </span>
            {product._count && product._count.reviews > 0 && (
              <span className="label" style={{ color: "var(--muted)", fontSize: "0.58rem" }}>
                {product._count.reviews} ulasan
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
export function ProductCardSkeleton() {
  return (
    <div style={{ background: "var(--obsidian-900)" }}>
      <div className="skeleton" style={{ aspectRatio: "3/4" }} />
      <div className="p-4 flex flex-col gap-2">
        <div className="skeleton h-3 w-16" />
        <div className="skeleton h-5 w-32" />
        <div className="skeleton h-4 w-20" />
      </div>
    </div>
  );
}
