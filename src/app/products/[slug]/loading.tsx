// src/app/products/[slug]/loading.tsx

import { Skeleton } from "@/components/ui/Badge";

export default function ProductDetailLoading() {
  return (
    <div style={{ paddingTop: "72px", minHeight: "100vh" }}>
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-0" style={{ minHeight: "85vh" }}>
        {/* Image skeleton */}
        <div
          className="skeleton"
          style={{
            height: "calc(100vh - 72px)",
            background: "var(--obsidian-900)",
          }}
        />
        {/* Info skeleton */}
        <div style={{ padding: "clamp(32px, 5vw, 64px)" }}>
          <div className="skeleton h-3 w-48 mb-8" />
          <div className="skeleton h-3 w-24 mb-3" />
          <div className="skeleton h-12 w-3/4 mb-4" />
          <div className="flex gap-2 mb-6">
            <div className="skeleton h-6 w-16" />
            <div className="skeleton h-6 w-12" />
            <div className="skeleton h-6 w-20" />
          </div>
          <div className="skeleton h-10 w-40 mb-6" />
          <div className="flex flex-col gap-2 mb-8">
            {[85, 100, 90, 75, 95].map((w, i) => (
              <div key={i} className="skeleton h-4" style={{ width: `${w}%` }} />
            ))}
          </div>
          <div className="flex gap-3">
            <div className="skeleton h-12 flex-1" />
            <div className="skeleton h-12 w-12" />
          </div>
        </div>
      </section>
    </div>
  );
}
