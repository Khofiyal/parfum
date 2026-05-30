// src/app/orders/[id]/page.tsx
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { getOrderDetail, cancelOrder } from "@/lib/actions/orders";
import { Badge } from "@/components/ui/Badge";
import { CancelOrderButton } from "@/components/checkout/CancelOrderButton";
import { PayAgainButton } from "@/components/checkout/PayAgainButton";

export const metadata: Metadata = { title: "Detail Pesanan" };

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
}

const STATUS_CONFIG: Record<string, {
  label: string;
  variant: "default" | "gold" | "success" | "warning" | "error";
  desc: string;
}> = {
  PENDING:    { label: "Menunggu Pembayaran", variant: "warning",  desc: "Selesaikan pembayaran dalam 2 jam" },
  PROCESSING: { label: "Diproses",            variant: "gold",     desc: "Pesanan sedang disiapkan" },
  SHIPPED:    { label: "Dalam Pengiriman",    variant: "gold",     desc: "Produk sedang dalam perjalanan" },
  DELIVERED:  { label: "Diterima",            variant: "success",  desc: "Pesanan telah sampai" },
  CANCELLED:  { label: "Dibatalkan",          variant: "error",    desc: "Pesanan telah dibatalkan" },
  REFUNDED:   { label: "Dikembalikan",        variant: "error",    desc: "Dana sudah dikembalikan" },
};

const PAYMENT_CONFIG: Record<string, { label: string; variant: "default" | "gold" | "success" | "warning" | "error" }> = {
  UNPAID:   { label: "Belum Dibayar",    variant: "warning" },
  PENDING:  { label: "Menunggu",         variant: "warning" },
  PAID:     { label: "Lunas",            variant: "success" },
  FAILED:   { label: "Gagal",            variant: "error" },
  EXPIRED:  { label: "Kadaluarsa",       variant: "error" },
  REFUNDED: { label: "Dikembalikan",     variant: "default" },
};

const ORDER_STEPS = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"] as const;

function OrderTimeline({ status }: { status: string }) {
  const currentIndex = ORDER_STEPS.indexOf(status as typeof ORDER_STEPS[number]);
  const isCancelled = status === "CANCELLED" || status === "REFUNDED";

  return (
    <div className="flex items-center gap-0">
      {ORDER_STEPS.map((step, i) => {
        const isCompleted = !isCancelled && currentIndex > i;
        const isActive    = !isCancelled && currentIndex === i;
        const labels = ["Pesanan Dibuat", "Diproses", "Dikirim", "Diterima"];

        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
                style={{
                  background: isCompleted
                    ? "var(--gold-600)"
                    : isActive
                    ? "rgba(196,162,74,0.2)"
                    : "var(--obsidian-700)",
                  border: isActive
                    ? "1px solid var(--gold-600)"
                    : isCompleted
                    ? "none"
                    : "1px solid var(--obsidian-600)",
                }}
              >
                {isCompleted ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--obsidian-950)" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <span
                    className="label"
                    style={{
                      fontSize: "0.6rem",
                      color: isActive ? "var(--gold-500)" : "var(--muted)",
                    }}
                  >
                    {i + 1}
                  </span>
                )}
              </div>
              <span
                className="label mt-2 text-center"
                style={{
                  fontSize: "0.55rem",
                  color: isActive ? "var(--gold-400)" : isCompleted ? "var(--muted-light)" : "var(--muted)",
                  width: "64px",
                }}
              >
                {labels[i]}
              </span>
            </div>
            {i < ORDER_STEPS.length - 1 && (
              <div
                className="flex-1 h-px mb-5 mx-1 transition-all duration-500"
                style={{
                  background: isCompleted ? "var(--gold-600)" : "var(--obsidian-600)",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default async function OrderDetailPage({ params, searchParams }: Props) {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const { id } = await params;
  const { status: paymentStatus } = await searchParams;

  const order = await getOrderDetail(id);
  if (!order) notFound();

  const statusCfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG["PENDING"]!;
  const paymentCfg = PAYMENT_CONFIG[order.paymentStatus] ?? PAYMENT_CONFIG["UNPAID"]!;

  const formatPrice = (n: number | { toNumber: () => number } | string) => {
    const num = typeof n === "object" && "toNumber" in n ? n.toNumber() : Number(n);
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num);
  };

  const total = typeof order.totalAmount === "object" && "toNumber" in order.totalAmount
    ? order.totalAmount.toNumber()
    : Number(order.totalAmount);

  const shipping = typeof order.shippingCost === "object" && "toNumber" in order.shippingCost
    ? order.shippingCost.toNumber()
    : Number(order.shippingCost);

  return (
    <div style={{ paddingTop: "72px", minHeight: "100vh", background: "var(--obsidian-950)" }}>
      <div style={{ padding: "48px var(--container-px)", maxWidth: "860px" }}>
        {/* Payment status banner */}
        {paymentStatus === "success" && (
          <div
            className="flex items-center gap-3 p-4 mb-8 animate-fade-in"
            style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <div>
              <p style={{ color: "#4ade80", fontWeight: 500 }}>Pembayaran Berhasil!</p>
              <p style={{ color: "var(--muted-light)", fontSize: "0.82rem" }}>
                Pesanan Anda sedang diproses. Kami akan mengirimkan notifikasi ketika produk dikirim.
              </p>
            </div>
          </div>
        )}
        {paymentStatus === "pending" && (
          <div
            className="flex items-center gap-3 p-4 mb-8"
            style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.2)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#facc15" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div>
              <p style={{ color: "#facc15", fontWeight: 500 }}>Pembayaran Menunggu Konfirmasi</p>
              <p style={{ color: "var(--muted-light)", fontSize: "0.82rem" }}>
                Kami sedang memverifikasi pembayaran Anda. Mohon tunggu sebentar.
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <div className="divider-gold w-6" />
              <span className="label" style={{ color: "var(--gold-500)" }}>Detail Pesanan</span>
            </div>
            <h1 className="font-display font-light" style={{ color: "var(--ivory-100)", fontSize: "clamp(1.6rem, 4vw, 2.5rem)" }}>
              #{order.id.substring(0, 12).toUpperCase()}
            </h1>
            <p style={{ color: "var(--muted)", fontSize: "0.78rem", marginTop: "6px" }}>
              {new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeStyle: "short" }).format(order.createdAt)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
            <Badge variant={paymentCfg.variant}>{paymentCfg.label}</Badge>
          </div>
        </div>

        {/* Timeline */}
        {!["CANCELLED", "REFUNDED"].includes(order.status) && (
          <div
            className="p-6 mb-8"
            style={{ background: "var(--obsidian-900)", border: "1px solid rgba(196,162,74,0.08)" }}
          >
            <OrderTimeline status={order.status} />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left — items & address */}
          <div className="md:col-span-2 flex flex-col gap-6">
            {/* Order items */}
            <div
              style={{ background: "var(--obsidian-900)", border: "1px solid rgba(196,162,74,0.08)" }}
            >
              <div className="p-4 border-b" style={{ borderColor: "rgba(196,162,74,0.06)" }}>
                <p className="label" style={{ color: "var(--gold-500)", fontSize: "0.62rem" }}>
                  Item Pesanan ({order.orderItems.length})
                </p>
              </div>
              <div className="flex flex-col">
                {order.orderItems.map((item, i) => {
                  const images = item.product.imageUrls as string[];
                  const itemPrice = typeof item.priceAtPurchase === "object" && "toNumber" in item.priceAtPurchase
                    ? (item.priceAtPurchase as { toNumber: () => number }).toNumber()
                    : Number(item.priceAtPurchase);

                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-4"
                      style={{
                        borderBottom: i < order.orderItems.length - 1
                          ? "1px solid rgba(196,162,74,0.05)"
                          : "none",
                      }}
                    >
                      <Link
                        href={`/products/${item.product.slug}`}
                        className="relative flex-shrink-0 overflow-hidden"
                        style={{ width: "60px", height: "76px", background: "var(--obsidian-800)" }}
                      >
                        {images[0] && (
                          <Image src={images[0]} alt={item.product.name} fill className="object-cover" sizes="60px" />
                        )}
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/products/${item.product.slug}`}
                          className="font-display text-lg hover:text-gold-400 transition-colors"
                          style={{ color: "var(--ivory-200)", display: "block" }}
                        >
                          {item.productName}
                        </Link>
                        <p style={{ color: "var(--muted)", fontSize: "0.75rem", marginTop: "3px" }}>
                          {formatPrice(itemPrice)} × {item.quantity}
                        </p>
                      </div>
                      <span className="font-display text-base" style={{ color: "var(--gold-400)", flexShrink: 0 }}>
                        {formatPrice(itemPrice * item.quantity)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shipping address */}
            {order.address && (
              <div
                className="p-5"
                style={{ background: "var(--obsidian-900)", border: "1px solid rgba(196,162,74,0.08)" }}
              >
                <p className="label mb-4" style={{ color: "var(--gold-500)", fontSize: "0.62rem" }}>
                  Alamat Pengiriman
                </p>
                <p style={{ color: "var(--ivory-300)", fontSize: "0.85rem", fontWeight: 400 }}>
                  {order.address.recipientName}
                </p>
                <p style={{ color: "var(--muted-light)", fontSize: "0.8rem", marginTop: "4px" }}>
                  {order.address.phone}
                </p>
                <p style={{ color: "var(--muted-light)", fontSize: "0.8rem", marginTop: "4px", lineHeight: 1.6 }}>
                  {order.address.fullAddress}<br />
                  {order.address.city}, {order.address.province} {order.address.postalCode}
                </p>
              </div>
            )}

            {/* Tracking */}
            {order.trackingNumber && (
              <div
                className="p-5"
                style={{ background: "var(--obsidian-900)", border: "1px solid rgba(196,162,74,0.08)" }}
              >
                <p className="label mb-3" style={{ color: "var(--gold-500)", fontSize: "0.62rem" }}>
                  Informasi Pengiriman
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p style={{ color: "var(--muted-light)", fontSize: "0.78rem" }}>
                      Kurir: <span style={{ color: "var(--ivory-300)" }}>{order.shippingCourier}</span>
                    </p>
                    <p style={{ color: "var(--muted-light)", fontSize: "0.78rem", marginTop: "4px" }}>
                      No. Resi: <span style={{ color: "var(--ivory-300)", fontFamily: "monospace" }}>{order.trackingNumber}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(order.trackingNumber!)}
                    className="label px-3 py-1.5 transition-colors hover:text-gold-400"
                    style={{ border: "1px solid rgba(196,162,74,0.15)", color: "var(--muted-light)", fontSize: "0.6rem" }}
                  >
                    Salin
                  </button>
                </div>
              </div>
            )}

            {/* Order notes */}
            {order.notes && (
              <div
                className="p-4"
                style={{ background: "var(--obsidian-900)", border: "1px solid rgba(196,162,74,0.08)" }}
              >
                <p className="label mb-2" style={{ color: "var(--gold-500)", fontSize: "0.62rem" }}>
                  Catatan
                </p>
                <p style={{ color: "var(--muted-light)", fontSize: "0.82rem" }}>{order.notes}</p>
              </div>
            )}
          </div>

          {/* Right — payment summary */}
          <div className="flex flex-col gap-4">
            <div
              className="p-5"
              style={{ background: "var(--obsidian-900)", border: "1px solid rgba(196,162,74,0.08)" }}
            >
              <p className="label mb-4" style={{ color: "var(--gold-500)", fontSize: "0.62rem" }}>
                Ringkasan Pembayaran
              </p>
              <div className="flex flex-col gap-2.5">
                <div className="flex justify-between">
                  <span style={{ color: "var(--muted-light)", fontSize: "0.8rem" }}>Subtotal</span>
                  <span style={{ color: "var(--ivory-300)", fontSize: "0.8rem" }}>
                    {formatPrice(total - shipping)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "var(--muted-light)", fontSize: "0.8rem" }}>Ongkos Kirim</span>
                  <span style={{ fontSize: "0.8rem", color: shipping === 0 ? "#4ade80" : "var(--ivory-300)" }}>
                    {shipping === 0 ? "Gratis" : formatPrice(shipping)}
                  </span>
                </div>
                {order.paymentMethod && (
                  <div className="flex justify-between">
                    <span style={{ color: "var(--muted-light)", fontSize: "0.8rem" }}>Metode</span>
                    <span style={{ color: "var(--ivory-300)", fontSize: "0.8rem", textTransform: "capitalize" }}>
                      {order.paymentMethod.replace(/_/g, " ")}
                    </span>
                  </div>
                )}
              </div>
              <div className="divider-gold my-4" />
              <div className="flex justify-between items-baseline">
                <span className="font-display text-base" style={{ color: "var(--ivory-100)" }}>Total</span>
                <span className="font-display text-xl" style={{ color: "var(--gold-400)" }}>
                  {formatPrice(total)}
                </span>
              </div>
              {order.paidAt && (
                <p className="label mt-2" style={{ color: "var(--muted)", fontSize: "0.58rem" }}>
                  Dibayar:{" "}
                  {new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(order.paidAt)}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              {/* Pay again if UNPAID and PENDING */}
              {order.paymentStatus === "UNPAID" && order.status === "PENDING" && order.snapToken && (
                <PayAgainButton snapToken={order.snapToken} orderId={order.id} />
              )}

              {/* Cancel */}
              {["PENDING", "PROCESSING"].includes(order.status) &&
                order.paymentStatus !== "PAID" && (
                  <CancelOrderButton orderId={order.id} />
                )}

              <Link
                href="/orders"
                className="label py-3 text-center transition-all"
                style={{
                  border: "1px solid rgba(196,162,74,0.12)",
                  color: "var(--muted-light)",
                  fontSize: "0.62rem",
                }}
              >
                Kembali ke Daftar Pesanan
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
