// src/app/catalog/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { template: "%s | Katalog — Maison Parfum", default: "Katalog" },
};

// Revalidate catalog setiap 60 detik (stok & harga bisa berubah)
export const revalidate = 60;

export default function CatalogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
