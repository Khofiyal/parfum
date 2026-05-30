// src/app/orders/page.tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = { title: "Riwayat Pesanan" };

const STATUS_BADGE: Record<string, { label: string; variant: "default" | "gold" | "success" | "warning" | "error" }> = {
  PENDING:    { label: "Menunggu Pembayaran", variant: "warning" },
  PROCESSING: { label: "Diproses",            variant: "gold" },
  SHIPPED:    { label: "Dikirim",             variant: "gold" },
  DELIVERED:  { label: "Diterima",            variant: "success" },
  CANCELLED:  { label: "Dibatalkan",          variant: "error" },
  REFUNDED:   { label: "Dikembalikan",        variant: "error" },
};

export default async function OrdersPage() {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      orderItems: {
        include: {
          product: { select: { name: true, imageUrls: true, slug: true } },
        },
        take: 3,
      },
      _count: { select: { orderItems: true } },
    },
  });

  const formatPrice = (n: number | { toNumber: () => number } | string) => {
    const num = typeof n === "object" && "toNumber" in n ? n.toNumber() : Number(n);
    return new Intl.NumberFormat("id-ID", {
      style: "currency", currency: "IDR", minimumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div style={{ paddingTop: "72px", minHeight: "100vh", background: "var(--obsidian-950)" }}>
      <div style={{ padding: "48px var(--container-px)", maxWidth: "900px" }}>
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="divider-gold w-8" />
            <span className="label" style={{ color: "var(--gold-500)" }}>
              Riwayat
            </span>
          </div>
          <h1 className="font-display font-light" style={{ color: "var(--ivory-100)" }}>
            Pesanan Saya
          </h1>
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="font-display text-7xl mb-6" style={{ color: "rgba(196,162,74,0.06)" }}>∅</div>
            <p style={{ color: "var(--muted-light)", marginBottom: "24px" }}>
              Belum ada pesanan. Mulai belanja sekarang!
            </p>
            <Link
              href="/catalog"
              className="label px-8 py-3"
              style={{ background: "var(--gold-600)", color: "var(--obsidian-950)", fontSize: "0.62rem" }}
            >
              Jelajahi Katalog
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {orders.map((order) => {
              const status = STATUS_BADGE[order.status] ?? STATUS_BADGE["PENDING"]!;
              const firstImages = order.orderItems
                .map((i) => (i.product.imageUrls as string[])[0])
                .filter(Boolean) as string[];

              return (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="group block transition-all duration-200"
                >
                  <div
                    className="p-5"
                    style={{
                      background: "var(--obsidian-900)",
                      border: "1px solid rgba(196,162,74,0.08)",
                    }}
                  >
                    {/* Top row */}
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                      <div>
                        <p className="label mb-1" style={{ color: "var(--muted)", fontSize: "0.58rem" }}>
                          No. Pesanan
                        </p>
                        <p style={{ color: "var(--ivory-300)", fontSize: "0.82rem", fontFamily: "monospace" }}>
                          #{order.id.substring(0, 16).toUpperCase()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={status.variant}>{status.label}</Badge>
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          className="transition-transform duration-200 group-hover:translate-x-1"
                          style={{ color: "var(--muted)" }}
                        >
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </div>
                    </div>

                    {/* Product thumbnails */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex -space-x-2">
                        {firstImages.slice(0, 3).map((img, i) => (
                          <div
                            key={i}
                            className="relative overflow-hidden"
                            style={{
                              width: "44px",
                              height: "56px",
                              border: "2px solid var(--obsidian-900)",
                              background: "var(--obsidian-800)",
                              zIndex: 3 - i,
                            }}
                          >
                            <img src={img} alt="Product" className="w-full h-full object-cover" />
                          </div>
                        ))}
                        {order._count.orderItems > 3 && (
                          <div
                            className="flex items-center justify-center"
                            style={{
                              width: "44px",
                              height: "56px",
                              background: "var(--obsidian-700)",
                              border: "2px solid var(--obsidian-900)",
                              color: "var(--muted-light)",
                              fontSize: "0.72rem",
                            }}
                          >
                            +{order._count.orderItems - 3}
                          </div>
                        )}
                      </div>
                      <div>
                        <p style={{ color: "var(--muted-light)", fontSize: "0.8rem" }}>
                          {order._count.orderItems} item
                        </p>
                        <p style={{ color: "var(--muted)", fontSize: "0.72rem" }}>
                          {new Intl.DateTimeFormat("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }).format(order.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Total */}
                    <div
                      className="flex justify-between items-center pt-3"
                      style={{ borderTop: "1px solid rgba(196,162,74,0.06)" }}
                    >
                      <span style={{ color: "var(--muted)", fontSize: "0.78rem" }}>
                        Total Pembayaran
                      </span>
                      <span
                        className="font-display text-lg"
                        style={{ color: "var(--gold-400)" }}
                      >
                        {formatPrice(order.totalAmount)}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
