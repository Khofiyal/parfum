// src/components/product/MobileFilterDrawer.tsx
"use client";

import { useState } from "react";
import { CatalogFilters } from "./CatalogFilters";

interface Props {
  options: { brands: string[]; sizes: string[]; categories: string[] };
}

export function MobileFilterDrawer({ options }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Trigger button */}
      <div className="flex items-center justify-between lg:hidden mb-6">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 label"
          style={{
            padding: "10px 18px",
            border: "1px solid rgba(196,162,74,0.2)",
            color: "var(--gold-400)",
            fontSize: "0.62rem",
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="8" y1="12" x2="16" y2="12" />
            <line x1="11" y1="18" x2="13" y2="18" />
          </svg>
          Filter & Urutkan
        </button>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 lg:hidden overflow-y-auto transition-transform duration-400"
        style={{
          background: "var(--obsidian-900)",
          borderTop: "1px solid rgba(196,162,74,0.12)",
          maxHeight: "85vh",
          padding: "24px 20px 40px",
          transform: isOpen ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Handle */}
        <div className="flex justify-center mb-6">
          <div
            className="w-10 h-1 rounded-full"
            style={{ background: "var(--obsidian-600)" }}
          />
        </div>

        <CatalogFilters
          options={options}
          isMobile
          onClose={() => setIsOpen(false)}
        />
      </div>
    </>
  );
}
