// src/app/admin/orders/[id]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db/prisma";
import { Badge } from "@/components/ui/Badge";
import { AdminOrderStatusForm } from "@/components/admin/AdminOrderStatusForm";

export const metadata: Metadata = { title: "Detail Pesanan — Admin" };

interface Props {
  params: Promise<{ id: string }>;
}

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "gold" | "success" | "warning" | "error" }> = {
  PENDING:    { label: "Menunggu Pembayaran", variant: "warning" },
  PROCESSING: { label: "Diproses",           variant: "gold" },
  SHIPPED:    { label: "Dalam Pengiriman",   variant: "gold" },
  DELIVERED:  { label: "Diterima",           variant: "success" },
  CANCELLED:  { label: "Dibatalkan",         variant: "error" },
  REFUNDED:   { label: "Dikembalikan",       variant: "error" },
};

const PAYMENT_CONFIG: Record<string, { label: string; variant: "default" | "gold" | "success" | "warning" | "error" }> = {
  UNPAID:   { label: "Belum Dibayar", variant: "warning" },
  PENDING:  { label: "Menunggu",      variant: "warning" },
  PAID:     { label: "Lunas",         variant: "success" },
  FAILED:   { label: "Gagal",         variant: "error" },
  EXPIRED:  { label: "Kadaluarsa",    variant: "error" },
  REFUNDED: { label: "Dikembalikan",  variant: "default" },
};

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      address: true,
      orderItems: {
        include: {
          product: { select: { name: true, slug: true, imageUrls: true } },
        },
      },
    },
  });

  if (!order) notFound();

  const statusCfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG["PENDING"]!;
  const paymentCfg = PAYMENT_CONFIG[order.paymentStatus] ?? PAYMENT_CONFIG["UNPAID"]!;

  const fmt = (n: number | { toNumber: () => number } | string) => {
    const num = typeof n === "object" && "toNumber" in n ? n.toNumber() : Number(n);
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num);
  };

  const total = typeof order.totalAmount === "object" && "toNumber" in order.totalAmount
    ? order.totalAmount.toNumber() : Number(order.totalAmount);
  const shipping = typeof order.shippingCost === "object" && "toNumber" in order.shippingCost
    ? order.shippingCost.toNumber() : Number(order.shippingCost);

  return (
    <div style={{ padding: "40px 32px" }}>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/admin/orders"
              className="label transition-colors hover:text-gold-400"
              style={{ color: "var(--muted)", fontSize: "0.6rem" }}
            >
              ← Kembali
            </Link>
          </div>
          <h1 className="font-display font-light" style={{ color: "var(--ivory-100)", fontSize: "2rem" }}>
            #{order.id.substring(0, 14).toUpperCase()}
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "0.78rem", marginTop: "4px" }}>
            {new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeStyle: "short" }).format(order.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
          <Badge variant={paymentCfg.variant}>{paymentCfg.label}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left — items */}
        <div className="xl:col-span-2 flex flex-col gap-5">
          {/* Order items */}
          <div style={{ background: "var(--obsidian-900)", border: "1px solid rgba(196,162,74,0.08)" }}>
            <div className="p-4 border-b" style={{ borderColor: "rgba(196,162,74,0.06)" }}>
              <p className="label" style={{ color: "var(--gold-500)", fontSize: "0.62rem" }}>
                Item Pesanan ({order.orderItems.length})
              </p>
            </div>
            {order.orderItems.map((item, i) => {
              const images = item.product.imageUrls as string[];
              const itemPrice = typeof item.priceAtPurchase === "object" && "toNumber" in item.priceAtPurchase
                ? (item.priceAtPurchase as { toNumber: () => number }).toNumber()
                : Number(item.priceAtPurchase);

              return (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4"
                  style={{ borderBottom: i < order.orderItems.length - 1 ? "1px solid rgba(196,162,74,0.05)" : "none" }}
                >
                  <div
                    className="relative flex-shrink-0 overflow-hidden"
                    style={{ width: "56px", height: "70px", background: "var(--obsidian-800)" }}
                  >
                    {images[0] && (
                      <Image src={images[0]} alt={item.productName} fill className="object-cover" sizes="56px" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p style={{ color: "var(--ivory-300)", fontSize: "0.82rem" }}>{item.productName}</p>
                    <p style={{ color: "var(--muted)", fontSize: "0.72rem", marginTop: "2px" }}>
                      {fmt(itemPrice)} × {item.quantity}
                    </p>
                  </div>
                  <span style={{ color: "var(--gold-400)", fontSize: "0.85rem" }}>
                    {fmt(itemPrice * item.quantity)}
                  </span>
                </div>
              );
            })}

            {/* Totals */}
            <div className="p-4 border-t" style={{ borderColor: "rgba(196,162,74,0.06)" }}>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <span style={{ color: "var(--muted-light)", fontSize: "0.78rem" }}>Subtotal</span>
                  <span style={{ color: "var(--ivory-300)", fontSize: "0.78rem" }}>{fmt(total - shipping)}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "var(--muted-light)", fontSize: "0.78rem" }}>Ongkos Kirim</span>
                  <span style={{ color: shipping === 0 ? "#4ade80" : "var(--ivory-300)", fontSize: "0.78rem" }}>
                    {shipping === 0 ? "Gratis" : fmt(shipping)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t" style={{ borderColor: "rgba(196,162,74,0.06)" }}>
                  <span className="font-display" style={{ color: "var(--ivory-100)" }}>Total</span>
                  <span className="font-display text-lg" style={{ color: "var(--gold-400)" }}>{fmt(total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Status & tracking form */}
          <div style={{ background: "var(--obsidian-900)", border: "1px solid rgba(196,162,74,0.08)" }}>
            <div className="p-4 border-b" style={{ borderColor: "rgba(196,162,74,0.06)" }}>
              <p className="label" style={{ color: "var(--gold-500)", fontSize: "0.62rem" }}>
                Update Status & Pengiriman
              </p>
            </div>
            <div className="p-5">
              <AdminOrderStatusForm
                orderId={order.id}
                currentStatus={order.status}
                currentTracking={order.trackingNumber ?? ""}
                currentCourier={order.shippingCourier ?? ""}
              />
            </div>
          </div>
        </div>

        {/* Right — customer & address */}
        <div className="flex flex-col gap-4">
          {/* Customer */}
          <div className="p-5" style={{ background: "var(--obsidian-900)", border: "1px solid rgba(196,162,74,0.08)" }}>
            <p className="label mb-4" style={{ color: "var(--gold-500)", fontSize: "0.62rem" }}>
              Pelanggan
            </p>
            <Link
              href={`/admin/users`}
              style={{ color: "var(--ivory-300)", fontSize: "0.85rem", display: "block" }}
            >
              {order.user.name ?? "—"}
            </Link>
            <p style={{ color: "var(--muted-light)", fontSize: "0.78rem", marginTop: "4px" }}>
              {order.user.email}
            </p>
            {order.paidAt && (
              <p style={{ color: "var(--muted)", fontSize: "0.72rem", marginTop: "8px" }}>
                Dibayar:{" "}
                {new Intl.DateTimeFormat("id-ID", { dateStyle: "short", timeStyle: "short" }).format(order.paidAt)}
              </p>
            )}
            {order.paymentMethod && (
              <p style={{ color: "var(--muted)", fontSize: "0.72rem", marginTop: "4px", textTransform: "capitalize" }}>
                Via: {order.paymentMethod.replace(/_/g, " ")}
              </p>
            )}
          </div>

          {/* Address */}
          {order.address && (
            <div className="p-5" style={{ background: "var(--obsidian-900)", border: "1px solid rgba(196,162,74,0.08)" }}>
              <p className="label mb-4" style={{ color: "var(--gold-500)", fontSize: "0.62rem" }}>
                Alamat Pengiriman
              </p>
              <p style={{ color: "var(--ivory-300)", fontSize: "0.82rem" }}>{order.address.recipientName}</p>
              <p style={{ color: "var(--muted-light)", fontSize: "0.78rem", marginTop: "3px" }}>{order.address.phone}</p>
              <p style={{ color: "var(--muted-light)", fontSize: "0.78rem", marginTop: "6px", lineHeight: 1.7 }}>
                {order.address.fullAddress}<br />
                {order.address.city}, {order.address.province}<br />
                {order.address.postalCode}
              </p>
            </div>
          )}

          {/* Idempotency info */}
          <div className="p-4" style={{ background: "var(--obsidian-900)", border: "1px solid rgba(196,162,74,0.06)" }}>
            <p className="label mb-2" style={{ color: "var(--muted)", fontSize: "0.58rem" }}>ID Internal</p>
            <p style={{ color: "var(--muted)", fontSize: "0.65rem", fontFamily: "monospace", wordBreak: "break-all" }}>
              {order.id}
            </p>
            {order.paymentId && (
              <>
                <p className="label mt-3 mb-1" style={{ color: "var(--muted)", fontSize: "0.58rem" }}>
                  Midtrans Transaction ID
                </p>
                <p style={{ color: "var(--muted)", fontSize: "0.65rem", fontFamily: "monospace" }}>
                  {order.paymentId}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
