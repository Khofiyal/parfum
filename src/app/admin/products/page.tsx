// src/app/admin/products/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { Badge } from "@/components/ui/Badge";
import { AdminProductActions } from "@/components/admin/AdminProductActions";

export const metadata: Metadata = { title: "Manajemen Produk — Admin" };

interface Props {
  searchParams: Promise<{ page?: string; search?: string; filter?: string }>;
}

export default async function AdminProductsPage({ searchParams }: Props) {
  const { page = "1", search, filter } = await searchParams;
  const PAGE_SIZE = 20;
  const currentPage = Math.max(1, parseInt(page));
  const skip = (currentPage - 1) * PAGE_SIZE;

  const where = {
    ...(filter !== "all" && filter !== "low-stock" && { isActive: true }),
    ...(filter === "low-stock" && { isActive: true, stock: { lte: 5 } }),
    ...(search && {
      OR: [
        { name: { contains: search } },
        { brand: { contains: search } },
      ],
    }),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
      select: {
        id: true, name: true, brand: true, price: true,
        stock: true, category: true, size: true, concentration: true,
        isActive: true, isFeatured: true, createdAt: true,
        imageUrls: true,
        _count: { select: { orderItems: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  const fmt = (n: number | { toNumber: () => number }) => {
    const num = typeof n === "object" && "toNumber" in n ? n.toNumber() : Number(n);
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num);
  };

  return (
    <div style={{ padding: "40px 32px" }}>
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-4 mb-3">
            <div className="divider-gold w-6" />
            <span className="label" style={{ color: "var(--gold-500)" }}>Manajemen</span>
          </div>
          <h1 className="font-display font-light" style={{ color: "var(--ivory-100)", fontSize: "2.2rem" }}>
            Produk
          </h1>
        </div>
        <Link
          href="/admin/products/new"
          className="label px-5 py-3 transition-all"
          style={{ background: "var(--gold-600)", color: "var(--obsidian-950)", fontSize: "0.62rem" }}
        >
          + Produk Baru
        </Link>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <form method="GET" className="flex-1 min-w-48 max-w-xs">
          <input
            name="search"
            defaultValue={search}
            placeholder="Cari nama / brand..."
            className="input-dark"
            style={{ fontSize: "0.82rem" }}
          />
        </form>
        <div className="flex gap-2">
          {[
            { key: undefined, label: "Aktif" },
            { key: "all", label: "Semua" },
            { key: "low-stock", label: "Stok Rendah" },
          ].map((f) => (
            <Link
              key={f.label}
              href={f.key ? `/admin/products?filter=${f.key}` : "/admin/products"}
              className="label px-3 py-1.5 transition-all"
              style={{
                border: filter === f.key ? "1px solid var(--gold-600)" : "1px solid rgba(196,162,74,0.12)",
                color: filter === f.key ? "var(--gold-400)" : "var(--muted)",
                background: filter === f.key ? "rgba(196,162,74,0.08)" : "transparent",
                fontSize: "0.6rem",
              }}
            >
              {f.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "var(--obsidian-900)", border: "1px solid rgba(196,162,74,0.08)" }}>
        <div
          className="hidden lg:grid grid-cols-12 gap-3 px-4 py-3 label"
          style={{ borderBottom: "1px solid rgba(196,162,74,0.06)", color: "var(--muted)", fontSize: "0.58rem" }}
        >
          <span className="col-span-1">Foto</span>
          <span className="col-span-3">Nama</span>
          <span className="col-span-2">Harga</span>
          <span className="col-span-1">Stok</span>
          <span className="col-span-2">Kategori</span>
          <span className="col-span-1">Status</span>
          <span className="col-span-2 text-right">Aksi</span>
        </div>

        {products.length === 0 ? (
          <div className="py-16 text-center">
            <p style={{ color: "var(--muted-light)" }}>Tidak ada produk</p>
          </div>
        ) : (
          products.map((p, i) => {
            const images = p.imageUrls as string[];
            const price = typeof p.price === "object" && "toNumber" in p.price
              ? p.price.toNumber() : Number(p.price);

            return (
              <div
                key={p.id}
                className="grid grid-cols-12 gap-3 items-center px-4 py-3"
                style={{
                  borderBottom: i < products.length - 1 ? "1px solid rgba(196,162,74,0.05)" : "none",
                  opacity: !p.isActive ? 0.5 : 1,
                }}
              >
                {/* Image */}
                <div className="col-span-1">
                  <div
                    className="relative overflow-hidden"
                    style={{ width: "40px", height: "50px", background: "var(--obsidian-800)", flexShrink: 0 }}
                  >
                    {images[0] && (
                      <img src={images[0]} alt={p.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                </div>

                {/* Name */}
                <div className="col-span-3">
                  <p style={{ color: "var(--ivory-300)", fontSize: "0.82rem" }}>{p.name}</p>
                  <p style={{ color: "var(--muted)", fontSize: "0.7rem" }}>{p.brand}</p>
                  {p.isFeatured && (
                    <Badge variant="gold">Featured</Badge>
                  )}
                </div>

                {/* Price */}
                <div className="hidden lg:block col-span-2">
                  <p style={{ color: "var(--gold-400)", fontSize: "0.82rem" }}>{fmt(price)}</p>
                  <p style={{ color: "var(--muted)", fontSize: "0.68rem" }}>{p._count.orderItems} terjual</p>
                </div>

                {/* Stock */}
                <div className="hidden lg:block col-span-1">
                  <p
                    style={{
                      fontSize: "0.82rem",
                      color: p.stock === 0 ? "#f87171" : p.stock <= 5 ? "#facc15" : "var(--ivory-300)",
                      fontWeight: p.stock <= 5 ? 500 : 300,
                    }}
                  >
                    {p.stock}
                  </p>
                </div>

                {/* Category */}
                <div className="hidden lg:block col-span-2">
                  <p style={{ color: "var(--muted-light)", fontSize: "0.75rem" }}>
                    {p.category} · {p.size}
                  </p>
                  <p style={{ color: "var(--muted)", fontSize: "0.68rem" }}>{p.concentration}</p>
                </div>

                {/* Status */}
                <div className="hidden lg:block col-span-1">
                  <Badge variant={p.isActive ? "success" : "error"}>
                    {p.isActive ? "Aktif" : "Nonaktif"}
                  </Badge>
                </div>

                {/* Actions */}
                <div className="col-span-8 lg:col-span-2 flex items-center justify-end gap-2">
                  <Link
                    href={`/admin/products/${p.id}`}
                    className="label px-3 py-1.5 transition-colors hover:text-gold-400"
                    style={{ border: "1px solid rgba(196,162,74,0.15)", color: "var(--muted-light)", fontSize: "0.58rem" }}
                  >
                    Edit
                  </Link>
                  <AdminProductActions productId={p.id} isActive={p.isActive} />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {Math.ceil(total / PAGE_SIZE) > 1 && (
        <div className="flex items-center gap-2 mt-6">
          <p style={{ color: "var(--muted)", fontSize: "0.78rem" }}>
            {total} produk · Hal. {currentPage} / {Math.ceil(total / PAGE_SIZE)}
          </p>
        </div>
      )}
    </div>
  );
}
