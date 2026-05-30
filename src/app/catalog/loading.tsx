// src/app/catalog/loading.tsx
// Loading skeleton untuk halaman katalog

import { ProductCardSkeleton } from "@/components/product/ProductCard";

export default function CatalogLoading() {
  return (
    <div style={{ paddingTop: "72px", minHeight: "100vh" }}>
      {/* Page header skeleton */}
      <div
        className="relative overflow-hidden"
        style={{
          padding: "60px var(--container-px) 50px",
          background: "var(--obsidian-900)",
          borderBottom: "1px solid rgba(196,162,74,0.06)",
        }}
      >
        <div className="skeleton h-3 w-24 mb-5" />
        <div className="skeleton h-12 w-64 mb-3" />
        <div className="skeleton h-4 w-80" />
      </div>

      <div
        className="flex gap-10"
        style={{ padding: "48px var(--container-px)" }}
      >
        {/* Sidebar skeleton */}
        <aside className="hidden lg:block flex-shrink-0" style={{ width: "220px" }}>
          <div className="flex flex-col gap-6">
            {[100, 80, 120, 90, 110].map((w, i) => (
              <div key={i}>
                <div className="skeleton h-3 mb-4" style={{ width: `${w * 0.5}px` }} />
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="skeleton h-7" style={{ width: `${40 + j * 15}px` }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Grid skeleton */}
        <div className="flex-1">
          <div className="skeleton h-4 w-32 mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
