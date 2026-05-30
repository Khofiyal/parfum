// src/app/admin/products/new/page.tsx
import type { Metadata } from "next";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata: Metadata = { title: "Tambah Produk Baru — Admin" };

export default function NewProductPage() {
  return (
    <div style={{ padding: "40px 32px", maxWidth: "860px" }}>
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-3">
          <div className="divider-gold w-6" />
          <span className="label" style={{ color: "var(--gold-500)" }}>Tambah</span>
        </div>
        <h1 className="font-display font-light" style={{ color: "var(--ivory-100)", fontSize: "2.2rem" }}>
          Produk Baru
        </h1>
      </div>
      <ProductForm product={null} />
    </div>
  );
}
