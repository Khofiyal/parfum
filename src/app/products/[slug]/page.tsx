// src/app/products/[slug]/page.tsx
// Halaman detail produk

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { getProductBySlug, getRelatedProducts } from "@/lib/actions/products";
import { ProductCard, ProductCardSkeleton } from "@/components/product/ProductCard";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { Badge, StarRating } from "@/components/ui/Badge";
import { auth } from "@/lib/auth";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Produk Tidak Ditemukan" };

  const images = product.imageUrls as string[];

  return {
    title: `${product.name} — ${product.brand}`,
    description: product.description.substring(0, 160),
    openGraph: {
      title: `${product.name} by ${product.brand}`,
      description: product.description.substring(0, 160),
      images: images[0] ? [{ url: images[0] }] : [],
    },
  };
}

// ─── Fragrance Notes visualizer ───────────────────────────────────────────────
function FragranceNotes({
  top,
  middle,
  base,
}: {
  top: string[];
  middle: string[];
  base: string[];
}) {
  const NoteGroup = ({
    label,
    notes,
    accent,
  }: {
    label: string;
    notes: string[];
    accent: string;
  }) => (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-2 h-2 rounded-full" style={{ background: accent }} />
        <span className="label" style={{ color: "var(--muted)", fontSize: "0.6rem" }}>
          {label}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {notes.map((note) => (
          <span
            key={note}
            className="label"
            style={{
              padding: "4px 10px",
              border: `1px solid ${accent}22`,
              color: "var(--ivory-300)",
              fontSize: "0.65rem",
              background: `${accent}08`,
            }}
          >
            {note}
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <div
      className="p-6 flex flex-col gap-6"
      style={{
        background: "var(--obsidian-900)",
        border: "1px solid rgba(196,162,74,0.08)",
      }}
    >
      <div className="flex items-center gap-4 mb-2">
        <div className="divider-gold w-6" />
        <span className="label" style={{ color: "var(--gold-500)" }}>
          Komposisi Aroma
        </span>
      </div>

      {/* Visual pyramid */}
      <div className="flex flex-col gap-5">
        <NoteGroup label="TOP NOTES · Kesan Pertama" notes={top} accent="#E8D5A3" />
        <NoteGroup label="HEART NOTES · Karakter Utama" notes={middle} accent="#C4A24A" />
        <NoteGroup label="BASE NOTES · Jejak Terakhir" notes={base} accent="#8B6F27" />
      </div>
    </div>
  );
}

// ─── Review list ──────────────────────────────────────────────────────────────
function ReviewList({
  reviews,
  totalCount,
}: {
  reviews: Array<{
    id: string;
    rating: number;
    comment: string;
    createdAt: Date;
    user: { name: string | null; image: string | null };
  }>;
  totalCount: number;
}) {
  if (reviews.length === 0) {
    return (
      <div
        className="py-12 text-center"
        style={{ border: "1px solid rgba(196,162,74,0.06)" }}
      >
        <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
          Belum ada ulasan. Jadilah yang pertama!
        </p>
      </div>
    );
  }

  const avgRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <div>
      {/* Summary */}
      <div className="flex items-center gap-6 mb-8">
        <div className="text-center">
          <p
            className="font-display text-5xl"
            style={{ color: "var(--ivory-100)", lineHeight: 1 }}
          >
            {avgRating.toFixed(1)}
          </p>
          <StarRating rating={avgRating} size={14} />
          <p className="label mt-1" style={{ color: "var(--muted)", fontSize: "0.58rem" }}>
            {totalCount} ulasan
          </p>
        </div>
        <div
          className="w-px self-stretch"
          style={{ background: "rgba(196,162,74,0.08)" }}
        />
        {/* Rating bars */}
        <div className="flex-1 flex flex-col gap-1.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = reviews.filter((r) => r.rating === star).length;
            const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-3">
                <span className="label w-3 text-right" style={{ color: "var(--muted)", fontSize: "0.58rem" }}>
                  {star}
                </span>
                <div
                  className="flex-1 h-1"
                  style={{ background: "var(--obsidian-700)" }}
                >
                  <div
                    style={{
                      width: `${pct}%`,
                      height: "100%",
                      background: "var(--gold-600)",
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>
                <span className="label w-6" style={{ color: "var(--muted)", fontSize: "0.58rem" }}>
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Individual reviews */}
      <div className="flex flex-col gap-6">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="pb-6"
            style={{ borderBottom: "1px solid rgba(196,162,74,0.06)" }}
          >
            <div className="flex items-start gap-3 mb-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-display text-sm"
                style={{
                  background: "var(--obsidian-700)",
                  border: "1px solid rgba(196,162,74,0.1)",
                  color: "var(--gold-400)",
                }}
              >
                {review.user.name?.charAt(0).toUpperCase() ?? "U"}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <span style={{ color: "var(--ivory-300)", fontSize: "0.85rem" }}>
                    {review.user.name ?? "Anonymous"}
                  </span>
                  <StarRating rating={review.rating} size={11} />
                </div>
                <p className="label mt-0.5" style={{ color: "var(--muted)", fontSize: "0.58rem" }}>
                  {new Date(review.createdAt).toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
            <p style={{ color: "var(--muted-light)", fontSize: "0.85rem", lineHeight: 1.7 }}>
              {review.comment}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Image gallery (client) ───────────────────────────────────────────────────
import { ProductImageGallery } from "@/components/product/ProductImageGallery";

// ─── Related products ─────────────────────────────────────────────────────────
async function RelatedProducts({
  productId,
  category,
}: {
  productId: string;
  category: string;
}) {
  const products = await getRelatedProducts(productId, category, 4);
  if (products.length === 0) return null;

  return (
    <section style={{ padding: "80px var(--container-px)" }}>
      <div className="flex items-center gap-4 mb-10">
        <div className="divider-gold w-8" />
        <span className="label" style={{ color: "var(--gold-500)" }}>
          Mungkin Anda Suka
        </span>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [product, session] = await Promise.all([
    getProductBySlug(slug),
    auth(),
  ]);

  if (!product) notFound();

  const imageUrls = product.imageUrls as string[];
  const topNotes = product.topNotes as string[];
  const middleNotes = product.middleNotes as string[];
  const baseNotes = product.baseNotes as string[];
  const price = typeof product.price === "object" && "toNumber" in product.price
    ? product.price.toNumber()
    : Number(product.price);

  const formattedPrice = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);

  return (
    <div style={{ paddingTop: "72px", minHeight: "100vh" }}>
      {/* Main product section */}
      <section
        className="grid grid-cols-1 lg:grid-cols-2 gap-0"
        style={{ minHeight: "85vh" }}
      >
        {/* Left — image gallery */}
        <div
          style={{
            position: "sticky",
            top: "72px",
            alignSelf: "flex-start",
            height: "calc(100vh - 72px)",
            background: "var(--obsidian-900)",
            borderRight: "1px solid rgba(196,162,74,0.06)",
          }}
        >
          <ProductImageGallery images={imageUrls} productName={product.name} />
        </div>

        {/* Right — info */}
        <div style={{ padding: "clamp(32px, 5vw, 64px)" }}>
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-8">
            <Link
              href="/"
              className="label transition-colors hover:text-gold-400"
              style={{ color: "var(--muted)", fontSize: "0.58rem" }}
            >
              Home
            </Link>
            <span style={{ color: "var(--muted)", fontSize: "0.6rem" }}>/</span>
            <Link
              href="/catalog"
              className="label transition-colors hover:text-gold-400"
              style={{ color: "var(--muted)", fontSize: "0.58rem" }}
            >
              Katalog
            </Link>
            <span style={{ color: "var(--muted)", fontSize: "0.6rem" }}>/</span>
            <span className="label" style={{ color: "var(--gold-500)", fontSize: "0.58rem" }}>
              {product.name}
            </span>
          </div>

          {/* Brand */}
          <p
            className="label mb-3"
            style={{ color: "var(--gold-500)", letterSpacing: "0.2em" }}
          >
            {product.brand}
          </p>

          {/* Name */}
          <h1
            className="font-display font-light mb-4"
            style={{ color: "var(--ivory-100)", lineHeight: 1.05 }}
          >
            {product.name}
          </h1>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <Badge variant="default">{product.concentration}</Badge>
            <Badge variant="default">{product.size}</Badge>
            <Badge variant="default">
              {product.gender === "unisex"
                ? "Unisex"
                : product.gender === "masculine"
                ? "Maskulin"
                : "Feminin"}
            </Badge>
            {product.isFeatured && <Badge variant="gold">Featured</Badge>}
          </div>

          {/* Rating summary */}
          {product._count.reviews > 0 && (
            <div className="flex items-center gap-3 mb-6">
              <StarRating
                rating={
                  product.reviews.reduce((s, r) => s + r.rating, 0) /
                  product.reviews.length
                }
                size={14}
              />
              <span style={{ color: "var(--muted-light)", fontSize: "0.8rem" }}>
                {product._count.reviews} ulasan
              </span>
            </div>
          )}

          {/* Price */}
          <div
            className="flex items-baseline gap-4 py-6 mb-6"
            style={{ borderTop: "1px solid rgba(196,162,74,0.08)", borderBottom: "1px solid rgba(196,162,74,0.08)" }}
          >
            <span
              className="font-display text-4xl"
              style={{ color: "var(--gold-400)" }}
            >
              {formattedPrice}
            </span>
          </div>

          {/* Description */}
          <p
            className="leading-relaxed mb-8"
            style={{ color: "var(--muted-light)", fontSize: "0.9rem" }}
          >
            {product.description}
          </p>

          {/* Stock info */}
          {product.stock <= 10 && product.stock > 0 && (
            <div
              className="flex items-center gap-2 mb-6 p-3"
              style={{ background: "rgba(234,179,8,0.06)", border: "1px solid rgba(234,179,8,0.15)" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#facc15" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span style={{ color: "#facc15", fontSize: "0.78rem" }}>
                Tersisa {product.stock} item
              </span>
            </div>
          )}

          {product.stock === 0 && (
            <div
              className="flex items-center gap-2 mb-6 p-3"
              style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}
            >
              <span style={{ color: "#f87171", fontSize: "0.78rem" }}>
                Stok habis
              </span>
            </div>
          )}

          {/* Add to cart */}
          <div className="flex gap-3">
            <AddToCartButton
              productId={product.id}
              isLoggedIn={!!session}
              isOutOfStock={product.stock === 0}
            />
            {/* Wishlist placeholder */}
            <button
              className="flex items-center justify-center w-12 h-12 transition-all duration-200"
              style={{
                border: "1px solid rgba(196,162,74,0.2)",
                color: "var(--muted-light)",
                flexShrink: 0,
              }}
              aria-label="Tambah ke wishlist"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>

          {/* Shipping info */}
          <div className="mt-8 flex flex-col gap-3">
            {[
              { icon: "🚚", text: "Pengiriman 1–3 hari kerja ke seluruh Indonesia" },
              { icon: "✓", text: "Produk original dengan sertifikat keaslian" },
              { icon: "📦", text: "Dikemas dengan kotak eksklusif siap kado" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <span style={{ fontSize: "0.9rem" }}>{item.icon}</span>
                <span style={{ color: "var(--muted)", fontSize: "0.78rem" }}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fragrance notes */}
      <section
        style={{ padding: "64px var(--container-px)", background: "var(--obsidian-950)" }}
      >
        <div className="max-w-2xl mx-auto">
          <FragranceNotes
            top={topNotes}
            middle={middleNotes}
            base={baseNotes}
          />
        </div>
      </section>

      {/* Reviews */}
      <section
        style={{
          padding: "64px var(--container-px)",
          background: "var(--obsidian-900)",
          borderTop: "1px solid rgba(196,162,74,0.06)",
        }}
      >
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-10">
            <div className="divider-gold w-8" />
            <span className="label" style={{ color: "var(--gold-500)" }}>
              Ulasan Pelanggan
            </span>
          </div>
          <ReviewList
            reviews={product.reviews}
            totalCount={product._count.reviews}
          />
        </div>
      </section>

      {/* Related products */}
      <div style={{ borderTop: "1px solid rgba(196,162,74,0.06)" }}>
        <Suspense
          fallback={
            <div style={{ padding: "80px var(--container-px)" }}>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            </div>
          }
        >
          <RelatedProducts productId={product.id} category={product.category} />
        </Suspense>
      </div>
    </div>
  );
}
