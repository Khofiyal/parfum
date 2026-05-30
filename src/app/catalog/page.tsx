// src/app/catalog/page.tsx
// Halaman katalog produk — filter, sort, pagination

import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { getProducts, getFilterOptions } from "@/lib/actions/products";
import { ProductCard, ProductCardSkeleton } from "@/components/product/ProductCard";
import { CatalogFilters } from "@/components/product/CatalogFilters";
import { MobileFilterDrawer } from "@/components/product/MobileFilterDrawer";

export const metadata: Metadata = {
  title: "Katalog Parfum",
  description:
    "Jelajahi koleksi parfum eksklusif dari brand-brand terkemuka dunia. Filter berdasarkan kategori, harga, ukuran, dan konsentrasi.",
};

// ─── Search params type ───────────────────────────────────────────────────────
interface CatalogPageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

// ─── Product grid (async) ─────────────────────────────────────────────────────
async function ProductGrid({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const data = await getProducts(searchParams);

  if (data.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div
          className="font-display text-8xl mb-6"
          style={{ color: "rgba(196,162,74,0.08)" }}
        >
          ∅
        </div>
        <h3 className="font-display text-2xl mb-3" style={{ color: "var(--ivory-300)" }}>
          Tidak ada produk ditemukan
        </h3>
        <p style={{ color: "var(--muted)", fontSize: "0.85rem", maxWidth: "300px" }}>
          Coba ubah filter atau gunakan kata kunci yang berbeda.
        </p>
        <Link
          href="/catalog"
          className="label mt-8 px-6 py-3"
          style={{
            border: "1px solid rgba(196,162,74,0.2)",
            color: "var(--gold-400)",
            fontSize: "0.62rem",
          }}
        >
          Hapus Semua Filter
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Count & sort indicator */}
      <div
        className="flex items-center justify-between mb-6 pb-4"
        style={{ borderBottom: "1px solid rgba(196,162,74,0.06)" }}
      >
        <p style={{ color: "var(--muted)", fontSize: "0.8rem" }}>
          <span style={{ color: "var(--ivory-300)" }}>{data.total}</span>{" "}
          produk ditemukan
        </p>
        <p style={{ color: "var(--muted)", fontSize: "0.75rem" }}>
          Hal. {data.page} / {data.totalPages}
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
        {data.items.map((product, i) => (
          <div
            key={product.id}
            className="animate-fade-up"
            style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
          >
            <ProductCard product={product} priority={i < 4} />
          </div>
        ))}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={data.page}
        totalPages={data.totalPages}
        hasNext={data.hasNextPage}
        hasPrev={data.hasPrevPage}
        searchParams={searchParams}
      />
    </>
  );
}

function ProductGridSkeleton() {
  return (
    <>
      <div
        className="flex items-center justify-between mb-6 pb-4"
        style={{ borderBottom: "1px solid rgba(196,162,74,0.06)" }}
      >
        <div className="skeleton h-4 w-32" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({
  currentPage,
  totalPages,
  hasNext,
  hasPrev,
  searchParams,
}: {
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  searchParams: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  const buildUrl = (page: number) => {
    const params = new URLSearchParams(
      Object.entries(searchParams).filter(([, v]) => v !== undefined) as [string, string][]
    );
    params.set("page", page.toString());
    return `/catalog?${params.toString()}`;
  };

  // Generate page numbers with ellipsis
  const pages: (number | "...")[] = [];
  const delta = 2;
  const left = currentPage - delta;
  const right = currentPage + delta;

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= left && i <= right)) {
      pages.push(i);
    } else if (
      (i === left - 1 && left > 2) ||
      (i === right + 1 && right < totalPages - 1)
    ) {
      pages.push("...");
    }
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-14">
      {hasPrev && (
        <Link
          href={buildUrl(currentPage - 1)}
          className="label px-4 py-2.5 transition-all duration-200"
          style={{
            border: "1px solid rgba(196,162,74,0.15)",
            color: "var(--muted-light)",
            fontSize: "0.6rem",
          }}
        >
          ← Prev
        </Link>
      )}

      {pages.map((page, i) =>
        page === "..." ? (
          <span
            key={`ellipsis-${i}`}
            style={{ color: "var(--muted)", padding: "0 4px" }}
          >
            ···
          </span>
        ) : (
          <Link
            key={page}
            href={buildUrl(page)}
            className="label flex items-center justify-center w-9 h-9 transition-all duration-200"
            style={{
              border:
                page === currentPage
                  ? "1px solid var(--gold-600)"
                  : "1px solid rgba(196,162,74,0.12)",
              background:
                page === currentPage ? "rgba(196,162,74,0.1)" : "transparent",
              color: page === currentPage ? "var(--gold-400)" : "var(--muted-light)",
              fontSize: "0.65rem",
            }}
          >
            {page}
          </Link>
        )
      )}

      {hasNext && (
        <Link
          href={buildUrl(currentPage + 1)}
          className="label px-4 py-2.5 transition-all duration-200"
          style={{
            border: "1px solid rgba(196,162,74,0.15)",
            color: "var(--muted-light)",
            fontSize: "0.6rem",
          }}
        >
          Next →
        </Link>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams;
  const filterOptions = await getFilterOptions();
  const activeCategory = params["category"];

  return (
    <div style={{ paddingTop: "72px", minHeight: "100vh" }}>
      {/* Page header */}
      <div
        className="relative overflow-hidden"
        style={{
          padding: "60px var(--container-px) 50px",
          background: "var(--obsidian-900)",
          borderBottom: "1px solid rgba(196,162,74,0.06)",
        }}
      >
        {/* Background decoration */}
        <div
          className="absolute inset-0 pointer-events-none select-none overflow-hidden flex items-center justify-end pr-20"
        >
          <span
            className="font-display uppercase"
            style={{
              fontSize: "clamp(5rem, 18vw, 14rem)",
              color: "rgba(196,162,74,0.025)",
              lineHeight: 1,
              letterSpacing: "0.05em",
              whiteSpace: "nowrap",
            }}
          >
            {activeCategory ?? "Katalog"}
          </span>
        </div>

        <div className="relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-5">
            <Link
              href="/"
              className="label transition-colors hover:text-gold-400"
              style={{ color: "var(--muted)", fontSize: "0.6rem" }}
            >
              Home
            </Link>
            <span style={{ color: "var(--muted)", fontSize: "0.6rem" }}>
              /
            </span>
            <span className="label" style={{ color: "var(--gold-500)", fontSize: "0.6rem" }}>
              Katalog
              {activeCategory ? ` — ${activeCategory}` : ""}
            </span>
          </div>

          <h1
            className="font-display font-light"
            style={{ color: "var(--ivory-100)" }}
          >
            {activeCategory
              ? activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)
              : "Semua Koleksi"}
          </h1>
          <p className="mt-3" style={{ color: "var(--muted-light)", fontSize: "0.9rem" }}>
            Wewangian premium dari rumah parfum terkemuka dunia
          </p>
        </div>
      </div>

      {/* Content */}
      <div
        className="flex gap-10"
        style={{ padding: "48px var(--container-px)" }}
      >
        {/* Sidebar filter — desktop */}
        <aside
          className="hidden lg:block flex-shrink-0"
          style={{
            width: "220px",
            position: "sticky",
            top: "92px",
            alignSelf: "flex-start",
            maxHeight: "calc(100vh - 110px)",
            overflowY: "auto",
          }}
        >
          <CatalogFilters options={filterOptions} />
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Mobile filter button */}
          <MobileFilterDrawer options={filterOptions} />

          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductGrid searchParams={params} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
