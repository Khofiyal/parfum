// src/app/admin/products/[id]/page.tsx
// Edit produk — juga dipakai untuk /admin/products/new (id = "new")

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { ProductForm } from "@/components/admin/ProductForm";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  if (id === "new") return { title: "Tambah Produk — Admin" };
  return { title: "Edit Produk — Admin" };
}

export default async function AdminProductFormPage({ params }: Props) {
  const { id } = await params;

  let product = null;
  if (id !== "new") {
    product = await prisma.product.findUnique({ where: { id } });
    if (!product) notFound();
  }

  return (
    <div style={{ padding: "40px 32px", maxWidth: "860px" }}>
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-3">
          <div className="divider-gold w-6" />
          <span className="label" style={{ color: "var(--gold-500)" }}>
            {id === "new" ? "Tambah" : "Edit"}
          </span>
        </div>
        <h1 className="font-display font-light" style={{ color: "var(--ivory-100)", fontSize: "2.2rem" }}>
          {id === "new" ? "Produk Baru" : product?.name}
        </h1>
      </div>

      <ProductForm product={product} />
    </div>
  );
}
