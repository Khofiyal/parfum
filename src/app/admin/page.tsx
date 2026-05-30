// src/app/admin/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = { title: "Admin Dashboard" };

export const revalidate = 60;

async function getDashboardStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const [
    totalOrders, todayOrders, pendingOrders,
    totalRevenue, monthRevenue,
    totalProducts, lowStockProducts,
    totalUsers,
    recentOrders,
    topProducts,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { createdAt: { gte: today } } }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.aggregate({
      where: { paymentStatus: "PAID" },
      _sum: { totalAmount: true },
    }),
    prisma.order.aggregate({
      where: { paymentStatus: "PAID", createdAt: { gte: monthStart } },
      _sum: { totalAmount: true },
    }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.product.count({ where: { isActive: true, stock: { lte: 5 } } }),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        _count: { select: { orderItems: true } },
      },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: { orderItems: { _count: "desc" } },
      take: 5,
      select: { id: true, name: true, brand: true, stock: true, price: true },
    }),
  ]);

  return {
    totalOrders, todayOrders, pendingOrders,
    totalRevenue: totalRevenue._sum.totalAmount?.toNumber() ?? 0,
    monthRevenue: monthRevenue._sum.totalAmount?.toNumber() ?? 0,
    totalProducts, lowStockProducts, totalUsers,
    recentOrders, topProducts,
  };
}

function StatCard({
  label, value, sub, accent = false,
}: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div
      className="p-5"
      style={{
        background: "var(--obsidian-900)",
        border: accent ? "1px solid rgba(196,162,74,0.2)" : "1px solid rgba(196,162,74,0.08)",
      }}
    >
      <p className="label mb-2" style={{ color: "var(--muted)", fontSize: "0.6rem" }}>{label}</p>
      <p className="font-display text-3xl" style={{ color: accent ? "var(--gold-400)" : "var(--ivory-100)" }}>
        {value}
      </p>
      {sub && (
        <p className="label mt-1" style={{ color: "var(--muted)", fontSize: "0.6rem" }}>{sub}</p>
      )}
    </div>
  );
}

const ORDER_STATUS: Record<string, { label: string; variant: "default" | "gold" | "success" | "warning" | "error" }> = {
  PENDING:    { label: "Menunggu",  variant: "warning" },
  PROCESSING: { label: "Diproses", variant: "gold" },
  SHIPPED:    { label: "Dikirim",  variant: "gold" },
  DELIVERED:  { label: "Selesai",  variant: "success" },
  CANCELLED:  { label: "Batal",    variant: "error" },
};

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  const fmt = (n: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 })
      .format(n);

  const fmtCompact = (n: number) => {
    if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}Jt`;
    if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}rb`;
    return fmt(n);
  };

  return (
    <div style={{ padding: "40px 32px" }}>
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-3">
          <div className="divider-gold w-6" />
          <span className="label" style={{ color: "var(--gold-500)" }}>Overview</span>
        </div>
        <h1 className="font-display font-light" style={{ color: "var(--ivory-100)", fontSize: "2.5rem" }}>
          Dashboard
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "0.82rem", marginTop: "4px" }}>
          {new Intl.DateTimeFormat("id-ID", { dateStyle: "full" }).format(new Date())}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Pendapatan"
          value={fmtCompact(stats.totalRevenue)}
          sub={`Bulan ini: ${fmtCompact(stats.monthRevenue)}`}
          accent
        />
        <StatCard
          label="Pesanan Hari Ini"
          value={stats.todayOrders.toString()}
          sub={`Total: ${stats.totalOrders} pesanan`}
        />
        <StatCard
          label="Menunggu Diproses"
          value={stats.pendingOrders.toString()}
          sub="Perlu tindakan segera"
        />
        <StatCard
          label="Total Pelanggan"
          value={stats.totalUsers.toLocaleString("id-ID")}
          sub={`${stats.totalProducts} produk aktif`}
        />
      </div>

      {/* Low stock alert */}
      {stats.lowStockProducts > 0 && (
        <Link
          href="/admin/products?filter=low-stock"
          className="flex items-center justify-between p-4 mb-8 transition-opacity hover:opacity-90"
          style={{
            background: "rgba(234,179,8,0.08)",
            border: "1px solid rgba(234,179,8,0.2)",
          }}
        >
          <div className="flex items-center gap-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#facc15" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span style={{ color: "#facc15", fontSize: "0.82rem" }}>
              <strong>{stats.lowStockProducts} produk</strong> dengan stok ≤ 5 unit
            </span>
          </div>
          <span style={{ color: "#facc15", fontSize: "0.72rem" }}>Kelola →</span>
        </Link>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div
          style={{ background: "var(--obsidian-900)", border: "1px solid rgba(196,162,74,0.08)" }}
        >
          <div
            className="flex items-center justify-between p-5 border-b"
            style={{ borderColor: "rgba(196,162,74,0.06)" }}
          >
            <p className="label" style={{ color: "var(--gold-500)", fontSize: "0.62rem" }}>
              Pesanan Terbaru
            </p>
            <Link
              href="/admin/orders"
              className="label transition-colors hover:text-gold-400"
              style={{ color: "var(--muted)", fontSize: "0.58rem" }}
            >
              Lihat Semua →
            </Link>
          </div>

          <div>
            {stats.recentOrders.map((order, i) => {
              const cfg = ORDER_STATUS[order.status] ?? ORDER_STATUS["PENDING"]!;
              const total = typeof order.totalAmount === "object" && "toNumber" in order.totalAmount
                ? order.totalAmount.toNumber() : Number(order.totalAmount);

              return (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between p-4 hover:bg-obsidian-800 transition-colors"
                  style={{
                    borderBottom: i < stats.recentOrders.length - 1
                      ? "1px solid rgba(196,162,74,0.05)"
                      : "none",
                  }}
                >
                  <div>
                    <p style={{ color: "var(--ivory-300)", fontSize: "0.82rem", fontFamily: "monospace" }}>
                      #{order.id.substring(0, 10).toUpperCase()}
                    </p>
                    <p style={{ color: "var(--muted)", fontSize: "0.72rem", marginTop: "2px" }}>
                      {order.user.name ?? order.user.email} · {order._count.orderItems} item
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <p style={{ color: "var(--gold-400)", fontSize: "0.82rem" }}>
                        {fmtCompact(total)}
                      </p>
                      <Badge variant={cfg.variant}>{cfg.label}</Badge>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Top products */}
        <div
          style={{ background: "var(--obsidian-900)", border: "1px solid rgba(196,162,74,0.08)" }}
        >
          <div
            className="flex items-center justify-between p-5 border-b"
            style={{ borderColor: "rgba(196,162,74,0.06)" }}
          >
            <p className="label" style={{ color: "var(--gold-500)", fontSize: "0.62rem" }}>
              Produk Terlaris
            </p>
            <Link
              href="/admin/products"
              className="label transition-colors hover:text-gold-400"
              style={{ color: "var(--muted)", fontSize: "0.58rem" }}
            >
              Kelola →
            </Link>
          </div>

          <div>
            {stats.topProducts.map((product, i) => {
              const price = typeof product.price === "object" && "toNumber" in product.price
                ? product.price.toNumber() : Number(product.price);

              return (
                <Link
                  key={product.id}
                  href={`/admin/products/${product.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-obsidian-800 transition-colors"
                  style={{
                    borderBottom: i < stats.topProducts.length - 1
                      ? "1px solid rgba(196,162,74,0.05)"
                      : "none",
                  }}
                >
                  <span
                    className="font-display text-2xl w-6 text-center"
                    style={{ color: i < 3 ? "var(--gold-600)" : "var(--muted)", flexShrink: 0 }}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="truncate" style={{ color: "var(--ivory-300)", fontSize: "0.82rem" }}>
                      {product.name}
                    </p>
                    <p style={{ color: "var(--muted)", fontSize: "0.72rem", marginTop: "2px" }}>
                      {product.brand}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p style={{ color: "var(--gold-400)", fontSize: "0.78rem" }}>
                      {fmtCompact(price)}
                    </p>
                    <p
                      className="label"
                      style={{
                        color: product.stock <= 5 ? "#facc15" : "var(--muted)",
                        fontSize: "0.58rem",
                      }}
                    >
                      {product.stock} stok
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
