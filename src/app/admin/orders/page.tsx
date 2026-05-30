// src/app/admin/orders/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { Badge } from "@/components/ui/Badge";
import { AdminOrderActions } from "@/components/admin/AdminOrderActions";

export const metadata: Metadata = { title: "Manajemen Pesanan — Admin" };

interface Props {
  searchParams: Promise<{
    status?: string;
    page?: string;
    search?: string;
  }>;
}

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "gold" | "success" | "warning" | "error" }> = {
  PENDING:    { label: "Menunggu",    variant: "warning" },
  PROCESSING: { label: "Diproses",   variant: "gold" },
  SHIPPED:    { label: "Dikirim",    variant: "gold" },
  DELIVERED:  { label: "Selesai",    variant: "success" },
  CANCELLED:  { label: "Dibatalkan", variant: "error" },
  REFUNDED:   { label: "Refund",     variant: "error" },
};

const ALL_STATUSES = Object.keys(STATUS_CONFIG);

export default async function AdminOrdersPage({ searchParams }: Props) {
  const { status, page = "1", search } = await searchParams;
  const PAGE_SIZE = 20;
  const currentPage = Math.max(1, parseInt(page));
  const skip = (currentPage - 1) * PAGE_SIZE;

  const where = {
    ...(status && ALL_STATUSES.includes(status) && { status: status as never }),
    ...(search && {
      OR: [
        { id: { contains: search } },
        { user: { email: { contains: search } } },
        { user: { name: { contains: search } } },
      ],
    }),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
      include: {
        user: { select: { name: true, email: true } },
        address: { select: { city: true, province: true } },
        _count: { select: { orderItems: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const fmt = (n: number | { toNumber: () => number }) => {
    const num = typeof n === "object" && "toNumber" in n ? n.toNumber() : Number(n);
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num);
  };

  return (
    <div style={{ padding: "40px 32px" }}>
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-3">
          <div className="divider-gold w-6" />
          <span className="label" style={{ color: "var(--gold-500)" }}>Manajemen</span>
        </div>
        <h1 className="font-display font-light" style={{ color: "var(--ivory-100)", fontSize: "2.2rem" }}>
          Pesanan
        </h1>
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Search */}
        <form method="GET" className="flex-1 min-w-48 max-w-xs">
          <input
            name="search"
            defaultValue={search}
            placeholder="Cari ID / nama / email..."
            className="input-dark"
            style={{ fontSize: "0.82rem" }}
          />
        </form>

        {/* Status filter tabs */}
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/orders"
            className="label px-3 py-1.5 transition-all"
            style={{
              border: !status ? "1px solid var(--gold-600)" : "1px solid rgba(196,162,74,0.15)",
              color: !status ? "var(--gold-400)" : "var(--muted-light)",
              fontSize: "0.6rem",
              background: !status ? "rgba(196,162,74,0.08)" : "transparent",
            }}
          >
            Semua ({total})
          </Link>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <Link
              key={key}
              href={`/admin/orders?status=${key}`}
              className="label px-3 py-1.5 transition-all"
              style={{
                border: status === key ? "1px solid var(--gold-600)" : "1px solid rgba(196,162,74,0.1)",
                color: status === key ? "var(--gold-400)" : "var(--muted)",
                fontSize: "0.6rem",
                background: status === key ? "rgba(196,162,74,0.08)" : "transparent",
              }}
            >
              {cfg.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "var(--obsidian-900)", border: "1px solid rgba(196,162,74,0.08)" }}>
        {/* Header */}
        <div
          className="hidden md:grid grid-cols-12 gap-3 px-4 py-3 label"
          style={{
            borderBottom: "1px solid rgba(196,162,74,0.06)",
            color: "var(--muted)",
            fontSize: "0.58rem",
          }}
        >
          <span className="col-span-3">ID / Pelanggan</span>
          <span className="col-span-2">Tanggal</span>
          <span className="col-span-2">Item</span>
          <span className="col-span-2">Total</span>
          <span className="col-span-1">Status</span>
          <span className="col-span-2 text-right">Aksi</span>
        </div>

        {orders.length === 0 ? (
          <div className="py-16 text-center">
            <p style={{ color: "var(--muted-light)" }}>Tidak ada pesanan ditemukan</p>
          </div>
        ) : (
          orders.map((order, i) => {
            const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG["PENDING"]!;
            const total = typeof order.totalAmount === "object" && "toNumber" in order.totalAmount
              ? order.totalAmount.toNumber() : Number(order.totalAmount);

            return (
              <div
                key={order.id}
                className="grid grid-cols-12 gap-3 items-center px-4 py-4"
                style={{
                  borderBottom: i < orders.length - 1 ? "1px solid rgba(196,162,74,0.05)" : "none",
                }}
              >
                <div className="col-span-12 md:col-span-3">
                  <p style={{ color: "var(--ivory-300)", fontSize: "0.75rem", fontFamily: "monospace" }}>
                    #{order.id.substring(0, 12).toUpperCase()}
                  </p>
                  <p style={{ color: "var(--muted)", fontSize: "0.72rem", marginTop: "2px" }}>
                    {order.user.name ?? order.user.email}
                  </p>
                  {order.address && (
                    <p style={{ color: "var(--muted)", fontSize: "0.68rem" }}>
                      {order.address.city}
                    </p>
                  )}
                </div>

                <div className="hidden md:block col-span-2">
                  <p style={{ color: "var(--muted-light)", fontSize: "0.75rem" }}>
                    {new Intl.DateTimeFormat("id-ID", { dateStyle: "short" }).format(order.createdAt)}
                  </p>
                  <p style={{ color: "var(--muted)", fontSize: "0.68rem" }}>
                    {new Intl.DateTimeFormat("id-ID", { timeStyle: "short" }).format(order.createdAt)}
                  </p>
                </div>

                <div className="hidden md:block col-span-2">
                  <p style={{ color: "var(--muted-light)", fontSize: "0.75rem" }}>
                    {order._count.orderItems} item
                  </p>
                </div>

                <div className="hidden md:block col-span-2">
                  <p style={{ color: "var(--gold-400)", fontSize: "0.82rem" }}>{fmt(total)}</p>
                </div>

                <div className="hidden md:block col-span-1">
                  <Badge variant={cfg.variant}>{cfg.label}</Badge>
                </div>

                <div className="col-span-12 md:col-span-2 flex items-center justify-end gap-2">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="label px-3 py-1.5 transition-colors hover:text-gold-400"
                    style={{
                      border: "1px solid rgba(196,162,74,0.15)",
                      color: "var(--muted-light)",
                      fontSize: "0.58rem",
                    }}
                  >
                    Detail
                  </Link>
                  <AdminOrderActions orderId={order.id} currentStatus={order.status} />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
            const p = i + 1;
            return (
              <Link
                key={p}
                href={`/admin/orders?${status ? `status=${status}&` : ""}page=${p}`}
                className="label w-8 h-8 flex items-center justify-center transition-all"
                style={{
                  border: p === currentPage ? "1px solid var(--gold-600)" : "1px solid rgba(196,162,74,0.12)",
                  color: p === currentPage ? "var(--gold-400)" : "var(--muted-light)",
                  background: p === currentPage ? "rgba(196,162,74,0.08)" : "transparent",
                  fontSize: "0.65rem",
                }}
              >
                {p}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
