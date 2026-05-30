// src/components/product/ProductImageGallery.tsx
"use client";

import { useState } from "react";
import Image from "next/image";

interface Props {
  images: string[];
  productName: string;
}

function normalizeImageUrl(url: string | undefined | null): string | null {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return url;
  const cleaned = url.replace(/^public\//, "").replace(/^\//, "");
  return "/" + cleaned;
}

export function ProductImageGallery({ images, productName }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const normalizedImages = images.map(normalizeImageUrl).filter(Boolean) as string[];
  const hasImages = normalizedImages.length > 0;
  const activeImage = normalizedImages[activeIndex] ?? null;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  return (
    <div className="flex h-full">
      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div
          className="flex flex-col gap-2 p-4 overflow-y-auto"
          style={{ width: "80px", flexShrink: 0 }}
        >
          {normalizedImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className="relative overflow-hidden transition-all duration-200"
              style={{
                width: "64px",
                height: "80px",
                flexShrink: 0,
                border:
                  i === activeIndex
                    ? "1px solid var(--gold-600)"
                    : "1px solid rgba(196,162,74,0.1)",
                opacity: i === activeIndex ? 1 : 0.5,
              }}
              aria-label={`Foto ${i + 1}`}
            >
              <Image
                src={img}
                alt={`${productName} foto ${i + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main image */}
      <div className="flex-1 relative overflow-hidden">
        <div
          className="relative w-full h-full cursor-crosshair"
          onMouseEnter={() => setIsZoomed(true)}
          onMouseLeave={() => setIsZoomed(false)}
          onMouseMove={handleMouseMove}
        >
          {hasImages && activeImage ? (
            <Image
              src={activeImage}
              alt={productName}
              fill
              priority
              className="object-contain transition-transform duration-200"
              style={{
                transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                transform: isZoomed ? "scale(1.8)" : "scale(1)",
                padding: "24px",
              }}
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          ) : (
            /* Placeholder when no image */
            <div
              className="absolute inset-0 flex flex-col items-center justify-center"
              style={{ background: "var(--obsidian-900)" }}
            >
              <span
                className="font-display text-8xl"
                style={{ color: "rgba(196,162,74,0.08)" }}
              >
                ✦
              </span>
              <p className="label mt-4" style={{ color: "var(--muted)", fontSize: "0.6rem" }}>
                Foto produk akan segera hadir
              </p>
            </div>
          )}
        </div>

        {/* Image counter */}
        {normalizedImages.length > 1 && (
          <div
            className="absolute bottom-4 right-4 label px-2 py-1"
            style={{
              background: "rgba(10,9,7,0.7)",
              color: "var(--muted-light)",
              fontSize: "0.58rem",
              backdropFilter: "blur(8px)",
            }}
          >
            {activeIndex + 1} / {normalizedImages.length}
          </div>
        )}

        {/* Zoom hint */}
        <div
          className="absolute bottom-4 left-4 label flex items-center gap-1.5"
          style={{
            opacity: isZoomed ? 0 : 1,
            transition: "opacity 0.2s ease",
            color: "var(--muted)",
            fontSize: "0.55rem",
          }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="11" y1="8" x2="11" y2="14" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
          Hover untuk zoom
        </div>

        {/* Arrow nav (mobile) */}
        {normalizedImages.length > 1 && (
          <>
            <button
              onClick={() =>
                setActiveIndex((i) => (i - 1 + normalizedImages.length) % normalizedImages.length)
              }
              className="absolute left-3 top-1/2 -translate-y-1/2 md:hidden flex items-center justify-center w-8 h-8"
              style={{
                background: "rgba(10,9,7,0.6)",
                border: "1px solid rgba(196,162,74,0.15)",
                color: "var(--ivory-300)",
              }}
            >
              ←
            </button>
            <button
              onClick={() =>
                setActiveIndex((i) => (i + 1) % normalizedImages.length)
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 md:hidden flex items-center justify-center w-8 h-8"
              style={{
                background: "rgba(10,9,7,0.6)",
                border: "1px solid rgba(196,162,74,0.15)",
                color: "var(--ivory-300)",
              }}
            >
              →
            </button>
          </>
        )}
      </div>
    </div>
  );
}
