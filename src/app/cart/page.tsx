// src/app/cart/page.tsx
// Halaman keranjang belanja

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getCart } from "@/lib/actions/cart";
import { CartItemRow } from "@/components/cart/CartItemRow";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Keranjang Belanja",
};

export default async function CartPage() {
  const session = await auth();
  if (!session) redirect("/auth/login?callbackUrl=/cart");

  const cartItems = await getCart();

  const subtotal = cartItems.reduce((sum, item) => {
    return sum + item.product.price * item.quantity;
  }, 0);

  const formatPrice = (n: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(n);

  const SHIPPING_THRESHOLD = 500_000;
  const SHIPPING_COST = subtotal >= SHIPPING_THRESHOLD ? 0 : 25_000;

  return (
    <div
      style={{ paddingTop: "72px", minHeight: "100vh", background: "var(--obsidian-950)" }}
    >
      <div style={{ padding: "48px var(--container-px)" }}>
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="divider-gold w-8" />
            <span className="label" style={{ color: "var(--gold-500)" }}>
              Keranjang Belanja
            </span>
          </div>
          <h1 className="font-display font-light" style={{ color: "var(--ivory-100)" }}>
            {cartItems.length === 0
              ? "Keranjang Kosong"
              : `${cartItems.length} Item`}
          </h1>
        </div>

        {cartItems.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div
              className="font-display text-8xl mb-6"
              style={{ color: "rgba(196,162,74,0.06)" }}
            >
              ∅
            </div>
            <p style={{ color: "var(--muted-light)", marginBottom: "24px" }}>
              Belum ada produk di keranjang Anda.
            </p>
            <Link
              href="/catalog"
              className="label px-8 py-3"
              style={{
                background: "var(--gold-600)",
                color: "var(--obsidian-950)",
                fontSize: "0.62rem",
              }}
            >
              Mulai Belanja
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Cart items */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              {/* Header row */}
              <div
                className="hidden md:grid grid-cols-12 gap-4 pb-3 label"
                style={{
                  borderBottom: "1px solid rgba(196,162,74,0.08)",
                  color: "var(--muted)",
                  fontSize: "0.6rem",
                  letterSpacing: "0.15em",
                }}
              >
                <span className="col-span-6">Produk</span>
                <span className="col-span-2 text-center">Harga</span>
                <span className="col-span-2 text-center">Jumlah</span>
                <span className="col-span-2 text-right">Total</span>
              </div>

              {cartItems.map((item) => (
                <CartItemRow key={item.id} item={item} />
              ))}
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1">
              <div
                className="p-6 sticky"
                style={{
                  background: "var(--obsidian-900)",
                  border: "1px solid rgba(196,162,74,0.08)",
                  top: "92px",
                }}
              >
                <p
                  className="label mb-6"
                  style={{ color: "var(--gold-500)", fontSize: "0.62rem" }}
                >
                  Ringkasan Pesanan
                </p>

                <div className="flex flex-col gap-3 mb-6">
                  <div className="flex justify-between">
                    <span style={{ color: "var(--muted-light)", fontSize: "0.85rem" }}>
                      Subtotal ({cartItems.length} item)
                    </span>
                    <span style={{ color: "var(--ivory-200)", fontSize: "0.85rem" }}>
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: "var(--muted-light)", fontSize: "0.85rem" }}>
                      Ongkos Kirim
                    </span>
                    <span style={{ fontSize: "0.85rem" }}>
                      {SHIPPING_COST === 0 ? (
                        <span style={{ color: "#4ade80" }}>Gratis</span>
                      ) : (
                        <span style={{ color: "var(--ivory-200)" }}>
                          {formatPrice(SHIPPING_COST)}
                        </span>
                      )}
                    </span>
                  </div>

                  {subtotal < SHIPPING_THRESHOLD && (
                    <div
                      className="p-2 text-center"
                      style={{
                        background: "rgba(196,162,74,0.05)",
                        border: "1px solid rgba(196,162,74,0.1)",
                      }}
                    >
                      <p style={{ color: "var(--gold-400)", fontSize: "0.72rem" }}>
                        Tambah {formatPrice(SHIPPING_THRESHOLD - subtotal)} lagi
                        untuk gratis ongkir!
                      </p>
                    </div>
                  )}

                  <div
                    className="divider-gold my-2"
                    style={{ height: "1px" }}
                  />

                  <div className="flex justify-between">
                    <span
                      className="font-display text-lg"
                      style={{ color: "var(--ivory-100)" }}
                    >
                      Total
                    </span>
                    <span
                      className="font-display text-xl"
                      style={{ color: "var(--gold-400)" }}
                    >
                      {formatPrice(subtotal + SHIPPING_COST)}
                    </span>
                  </div>
                </div>

                <Link href="/checkout" className="block">
                  <Button variant="primary" size="lg" className="w-full">
                    Lanjut ke Checkout
                  </Button>
                </Link>

                <Link
                  href="/catalog"
                  className="label flex items-center justify-center gap-2 mt-4 transition-colors hover:text-gold-400"
                  style={{ color: "var(--muted)", fontSize: "0.6rem" }}
                >
                  ← Lanjut Belanja
                </Link>

                {/* Trust signals */}
                <div
                  className="mt-6 pt-6 flex flex-col gap-2"
                  style={{ borderTop: "1px solid rgba(196,162,74,0.06)" }}
                >
                  {[
                    "Pembayaran 100% aman & terenkripsi",
                    "Semua produk original bergaransi",
                  ].map((t) => (
                    <div key={t} className="flex items-center gap-2">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--gold-700)"
                        strokeWidth="2"
                      >
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                      <span style={{ color: "var(--muted)", fontSize: "0.72rem" }}>
                        {t}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
