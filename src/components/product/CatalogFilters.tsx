// src/components/product/CatalogFilters.tsx
"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useCallback, useTransition } from "react";
import { Button } from "@/components/ui/Button";

interface FilterOptions {
  brands: string[];
  sizes: string[];
  categories: string[];
}

const CONCENTRATIONS = ["Parfum", "EDP", "EDT", "EDC"];
const GENDERS = [
  { value: "unisex", label: "Unisex" },
  { value: "masculine", label: "Maskulin" },
  { value: "feminine", label: "Feminin" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Terbaru" },
  { value: "popular", label: "Terpopuler" },
  { value: "price_asc", label: "Harga: Murah → Mahal" },
  { value: "price_desc", label: "Harga: Mahal → Murah" },
];

const CATEGORY_LABELS: Record<string, string> = {
  floral: "Floral",
  woody: "Woody",
  oriental: "Oriental",
  fresh: "Fresh",
  citrus: "Citrus",
  gourmand: "Gourmand",
  chypre: "Chypre",
  fougere: "Fougere",
  aquatic: "Aquatic",
};

interface Props {
  options: FilterOptions;
  isMobile?: boolean;
  onClose?: () => void;
}

export function CatalogFilters({ options, isMobile, onClose }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Local state mirrors URL params
  const [priceRange, setPriceRange] = useState({
    min: Number(searchParams.get("minPrice") ?? 0),
    max: Number(searchParams.get("maxPrice") ?? 5000000),
  });

  const updateFilter = useCallback(
    (key: string, value: string | null) => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
        params.delete("page"); // reset ke page 1 saat filter berubah
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [pathname, router, searchParams]
  );

  const toggleFilter = useCallback(
    (key: string, value: string) => {
      const current = searchParams.get(key);
      updateFilter(key, current === value ? null : value);
    },
    [searchParams, updateFilter]
  );

  const isActive = (key: string, value: string) =>
    searchParams.get(key) === value;

  const resetAll = () => {
    startTransition(() => {
      router.push(pathname);
      setPriceRange({ min: 0, max: 5000000 });
    });
  };

  const hasActiveFilters =
    searchParams.has("brand") ||
    searchParams.has("category") ||
    searchParams.has("size") ||
    searchParams.has("concentration") ||
    searchParams.has("gender") ||
    searchParams.has("minPrice") ||
    searchParams.has("maxPrice");

  const FilterSection = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <div>
      <p
        className="label mb-4"
        style={{ color: "var(--gold-600)", fontSize: "0.6rem" }}
      >
        {title}
      </p>
      {children}
      <div
        className="mt-5 mb-1"
        style={{ height: "1px", background: "rgba(196,162,74,0.06)" }}
      />
    </div>
  );

  const ChipButton = ({
    active,
    onClick,
    children,
  }: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
  }) => (
    <button
      onClick={onClick}
      className="label transition-all duration-200"
      style={{
        padding: "5px 12px",
        fontSize: "0.6rem",
        letterSpacing: "0.12em",
        border: active
          ? "1px solid var(--gold-600)"
          : "1px solid rgba(196,162,74,0.12)",
        background: active ? "rgba(196,162,74,0.12)" : "transparent",
        color: active ? "var(--gold-400)" : "var(--muted-light)",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );

  return (
    <div
      style={{
        opacity: isPending ? 0.6 : 1,
        transition: "opacity 0.2s ease",
        pointerEvents: isPending ? "none" : "auto",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <span className="label" style={{ color: "var(--ivory-300)" }}>
            Filter
          </span>
          {hasActiveFilters && (
            <span
              className="label px-2 py-0.5"
              style={{
                background: "var(--gold-600)",
                color: "var(--obsidian-950)",
                fontSize: "0.55rem",
              }}
            >
              Aktif
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {hasActiveFilters && (
            <button
              onClick={resetAll}
              className="label transition-colors hover:text-gold-400"
              style={{ color: "var(--muted)", fontSize: "0.58rem" }}
            >
              Reset
            </button>
          )}
          {isMobile && onClose && (
            <button
              onClick={onClose}
              style={{ color: "var(--muted-light)" }}
              aria-label="Tutup filter"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Sort */}
        <FilterSection title="Urutkan">
          <div className="flex flex-col gap-2">
            {SORT_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                <input
                  type="radio"
                  name="sort"
                  value={opt.value}
                  checked={
                    (searchParams.get("sortBy") ?? "newest") === opt.value
                  }
                  onChange={() => updateFilter("sortBy", opt.value)}
                  style={{
                    accentColor: "var(--gold-600)",
                    width: "14px",
                    height: "14px",
                    cursor: "pointer",
                  }}
                />
                <span
                  className="text-sm"
                  style={{ color: "var(--muted-light)", fontSize: "0.8rem" }}
                >
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Category */}
        <FilterSection title="Kategori">
          <div className="flex flex-wrap gap-2">
            {options.categories.map((cat) => (
              <ChipButton
                key={cat}
                active={isActive("category", cat)}
                onClick={() => toggleFilter("category", cat)}
              >
                {CATEGORY_LABELS[cat] ?? cat}
              </ChipButton>
            ))}
          </div>
        </FilterSection>

        {/* Gender */}
        <FilterSection title="Gender">
          <div className="flex flex-wrap gap-2">
            {GENDERS.map((g) => (
              <ChipButton
                key={g.value}
                active={isActive("gender", g.value)}
                onClick={() => toggleFilter("gender", g.value)}
              >
                {g.label}
              </ChipButton>
            ))}
          </div>
        </FilterSection>

        {/* Concentration */}
        <FilterSection title="Konsentrasi">
          <div className="flex flex-wrap gap-2">
            {CONCENTRATIONS.map((c) => (
              <ChipButton
                key={c}
                active={isActive("concentration", c)}
                onClick={() => toggleFilter("concentration", c)}
              >
                {c}
              </ChipButton>
            ))}
          </div>
        </FilterSection>

        {/* Size */}
        <FilterSection title="Ukuran">
          <div className="flex flex-wrap gap-2">
            {options.sizes.map((size) => (
              <ChipButton
                key={size}
                active={isActive("size", size)}
                onClick={() => toggleFilter("size", size)}
              >
                {size}
              </ChipButton>
            ))}
          </div>
        </FilterSection>

        {/* Price range */}
        <FilterSection title="Rentang Harga">
          <div className="px-1">
            <div className="flex justify-between mb-3">
              <span className="label" style={{ color: "var(--muted)", fontSize: "0.6rem" }}>
                Rp {(priceRange.min / 1000).toFixed(0)}rb
              </span>
              <span className="label" style={{ color: "var(--muted)", fontSize: "0.6rem" }}>
                Rp {(priceRange.max / 1000).toFixed(0)}rb
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={5000000}
              step={100000}
              value={priceRange.max}
              onChange={(e) => {
                const val = Number(e.target.value);
                setPriceRange((p) => ({ ...p, max: val }));
              }}
              onMouseUp={() => updateFilter("maxPrice", priceRange.max.toString())}
              onTouchEnd={() => updateFilter("maxPrice", priceRange.max.toString())}
            />
          </div>
        </FilterSection>

        {/* Brand */}
        <div>
          <p className="label mb-4" style={{ color: "var(--gold-600)", fontSize: "0.6rem" }}>
            Brand
          </p>
          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
            {options.brands.map((brand) => (
              <label
                key={brand}
                className="flex items-center gap-2.5 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={isActive("brand", brand)}
                  onChange={() => toggleFilter("brand", brand)}
                />
                <span style={{ color: "var(--muted-light)", fontSize: "0.8rem" }}>
                  {brand}
                </span>
              </label>
            ))}
          </div>
        </div>

        {isMobile && (
          <Button variant="primary" className="w-full mt-4" onClick={onClose}>
            Terapkan Filter
          </Button>
        )}
      </div>
    </div>
  );
}
