// src/components/checkout/CheckoutForm.tsx
"use client";

import { useState, useTransition } from "react";
import type { Address, Cart, Product } from "@prisma/client";
import { createOrder } from "@/lib/actions/orders";
import { AddressForm } from "./AddressForm";
import { MidtransSnap } from "./MidtransSnap";
import { Button } from "@/components/ui/Button";
import Image from "next/image";

type CartWithProduct = {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  product: {
    id: string;
    name: string;
    brand: string;
    price: number;   // sudah number setelah serialize
    imageUrls: unknown;
    size: string;
    concentration: string;
  };
};

interface Props {
  addresses: Address[];
  cartItems: CartWithProduct[];
}

const formatPrice = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

export function CheckoutForm({ addresses, cartItems }: Props) {
  const [isPending, startTransition] = useTransition();
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? ""
  );
  const [notes, setNotes] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(addresses.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [snapData, setSnapData] = useState<{ token: string; orderId: string } | null>(null);

  const subtotal = cartItems.reduce((sum, item) => {
    return sum + (item.product.price as number) * item.quantity;
  }, 0);

  const SHIPPING_COST = subtotal >= 500_000 ? 0 : 25_000;
  const total = subtotal + SHIPPING_COST;

  const handlePlaceOrder = () => {
    if (!selectedAddressId) { setError("Pilih alamat pengiriman"); return; }
    setError(null);

    startTransition(async () => {
      const result = await createOrder({ addressId: selectedAddressId, notes: notes || undefined });
      if (!result.success) { setError(result.error ?? "Gagal membuat order"); return; }
      setSnapData({ token: result.data!.snapToken, orderId: result.data!.orderId });
    });
  };

  // Jika Snap token sudah ada, render MidtransSnap (akan otomatis buka popup)
  if (snapData) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <MidtransSnap
          snapToken={snapData.token}
          orderId={snapData.orderId}
          onClose={() => setSnapData(null)}
        />
        <div
          className="w-12 h-12 border-2 border-t-transparent rounded-full mb-6"
          style={{
            borderColor: "var(--gold-600)",
            borderTopColor: "transparent",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <p className="font-display text-2xl mb-2" style={{ color: "var(--ivory-200)" }}>
          Membuka Halaman Pembayaran
        </p>
        <p style={{ color: "var(--muted-light)", fontSize: "0.85rem" }}>
          Jangan tutup halaman ini...
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
      {/* Left — address + notes */}
      <div className="lg:col-span-3 flex flex-col gap-8">

        {/* Address section */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <p className="label" style={{ color: "var(--gold-500)", fontSize: "0.62rem" }}>
              Alamat Pengiriman
            </p>
            {!showAddressForm && (
              <button
                onClick={() => setShowAddressForm(true)}
                className="label transition-colors hover:text-gold-400"
                style={{ color: "var(--muted-light)", fontSize: "0.6rem" }}
              >
                + Tambah Alamat
              </button>
            )}
          </div>

          {showAddressForm ? (
            <div
              className="p-5"
              style={{ background: "var(--obsidian-900)", border: "1px solid rgba(196,162,74,0.12)" }}
            >
              <p className="font-display text-lg mb-5" style={{ color: "var(--ivory-200)" }}>
                {addresses.length === 0 ? "Tambah Alamat Pertama" : "Alamat Baru"}
              </p>
              <AddressForm
                onSuccess={(id) => {
                  if (id) setSelectedAddressId(id);
                  setShowAddressForm(false);
                }}
                onCancel={addresses.length > 0 ? () => setShowAddressForm(false) : undefined}
              />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {addresses.map((addr) => (
                <button
                  key={addr.id}
                  onClick={() => setSelectedAddressId(addr.id)}
                  className="w-full text-left p-4 transition-all duration-200"
                  style={{
                    background: "var(--obsidian-900)",
                    border: selectedAddressId === addr.id
                      ? "1px solid var(--gold-600)"
                      : "1px solid rgba(196,162,74,0.08)",
                  }}
                >
                  <div className="flex items-start gap-3">
                    {/* Radio */}
                    <div
                      className="mt-0.5 w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center"
                      style={{
                        border: `1px solid ${selectedAddressId === addr.id ? "var(--gold-600)" : "var(--obsidian-500)"}`,
                      }}
                    >
                      {selectedAddressId === addr.id && (
                        <div className="w-2 h-2 rounded-full" style={{ background: "var(--gold-600)" }} />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="label" style={{ color: "var(--ivory-200)", fontSize: "0.65rem" }}>
                          {addr.label}
                        </span>
                        {addr.isDefault && (
                          <span
                            className="label px-1.5 py-0.5"
                            style={{ background: "rgba(196,162,74,0.1)", color: "var(--gold-500)", fontSize: "0.55rem" }}
                          >
                            Utama
                          </span>
                        )}
                      </div>
                      <p style={{ color: "var(--ivory-300)", fontSize: "0.82rem", fontWeight: 400 }}>
                        {addr.recipientName} · {addr.phone}
                      </p>
                      <p style={{ color: "var(--muted-light)", fontSize: "0.78rem", marginTop: "4px" }}>
                        {addr.fullAddress}, {addr.city}, {addr.province} {addr.postalCode}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Catatan */}
        <div>
          <p className="label mb-3" style={{ color: "var(--gold-500)", fontSize: "0.62rem" }}>
            Catatan Pesanan (Opsional)
          </p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Instruksi khusus untuk kurir atau pengemasan..."
            rows={3}
            maxLength={500}
            className="input-dark"
            style={{ resize: "vertical" }}
          />
          <p className="text-right mt-1" style={{ color: "var(--muted)", fontSize: "0.68rem" }}>
            {notes.length}/500
          </p>
        </div>

        {/* Shipping info */}
        <div
          className="p-4"
          style={{ background: "var(--obsidian-900)", border: "1px solid rgba(196,162,74,0.08)" }}
        >
          <p className="label mb-3" style={{ color: "var(--gold-500)", fontSize: "0.62rem" }}>
            Informasi Pengiriman
          </p>
          <div className="flex flex-col gap-2">
            {[
              { icon: "🚚", text: "Estimasi 1–3 hari kerja ke seluruh Indonesia" },
              { icon: "📦", text: "Dikemas dengan kotak eksklusif anti-pecah" },
              { icon: "✓", text: "Dilengkapi asuransi pengiriman" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <span style={{ fontSize: "0.85rem" }}>{item.icon}</span>
                <span style={{ color: "var(--muted-light)", fontSize: "0.78rem" }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — order summary + CTA */}
      <div className="lg:col-span-2">
        <div
          className="p-6 sticky"
          style={{
            background: "var(--obsidian-900)",
            border: "1px solid rgba(196,162,74,0.08)",
            top: "92px",
          }}
        >
          <p className="label mb-5" style={{ color: "var(--gold-500)", fontSize: "0.62rem" }}>
            Ringkasan Pesanan
          </p>

          {/* Items */}
          <div className="flex flex-col gap-3 mb-5">
            {cartItems.map((item) => {
              const price = typeof item.product.price === "object" && "toNumber" in item.product.price
                ? (item.product.price as { toNumber: () => number }).toNumber()
                : Number(item.product.price);
              const images = item.product.imageUrls as string[];

              return (
                <div key={item.id} className="flex items-center gap-3">
                  <div
                    className="relative flex-shrink-0 overflow-hidden"
                    style={{ width: "48px", height: "60px", background: "var(--obsidian-800)" }}
                  >
                    {images[0] && (
                      <Image src={images[0]} alt={item.product.name} fill className="object-cover" sizes="48px" />
                    )}
                    <div
                      className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center label"
                      style={{ background: "var(--gold-600)", color: "var(--obsidian-950)", fontSize: "0.55rem" }}
                    >
                      {item.quantity}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="label mb-0.5" style={{ color: "var(--muted)", fontSize: "0.55rem" }}>
                      {item.product.brand}
                    </p>
                    <p className="truncate" style={{ color: "var(--ivory-300)", fontSize: "0.78rem" }}>
                      {item.product.name}
                    </p>
                    <p className="label" style={{ color: "var(--muted)", fontSize: "0.55rem" }}>
                      {item.product.size} · {item.product.concentration}
                    </p>
                  </div>
                  <span style={{ color: "var(--gold-400)", fontSize: "0.82rem", flexShrink: 0 }}>
                    {formatPrice(price * item.quantity)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="divider-gold mb-4" />

          {/* Price breakdown */}
          <div className="flex flex-col gap-2.5 mb-5">
            <div className="flex justify-between">
              <span style={{ color: "var(--muted-light)", fontSize: "0.82rem" }}>Subtotal</span>
              <span style={{ color: "var(--ivory-300)", fontSize: "0.82rem" }}>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "var(--muted-light)", fontSize: "0.82rem" }}>Ongkos Kirim</span>
              <span style={{ fontSize: "0.82rem", color: SHIPPING_COST === 0 ? "#4ade80" : "var(--ivory-300)" }}>
                {SHIPPING_COST === 0 ? "Gratis" : formatPrice(SHIPPING_COST)}
              </span>
            </div>
          </div>

          <div className="divider-gold mb-4" />

          <div className="flex justify-between items-baseline mb-6">
            <span className="font-display text-lg" style={{ color: "var(--ivory-100)" }}>Total</span>
            <span className="font-display text-2xl" style={{ color: "var(--gold-400)" }}>
              {formatPrice(total)}
            </span>
          </div>

          {error && (
            <div className="p-3 mb-4" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <p style={{ color: "#f87171", fontSize: "0.78rem" }}>{error}</p>
            </div>
          )}

          <Button
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={isPending}
            onClick={handlePlaceOrder}
            disabled={!selectedAddressId || cartItems.length === 0}
          >
            Lanjut ke Pembayaran
          </Button>

          {/* Payment methods */}
          <div className="mt-5 flex flex-col gap-3">
            <p className="label text-center" style={{ color: "var(--muted)", fontSize: "0.58rem" }}>
              Metode pembayaran yang tersedia
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["GoPay", "OVO", "Dana", "BCA", "Mandiri", "BRI", "BNI", "Visa", "Mastercard"].map((m) => (
                <span
                  key={m}
                  className="label px-2 py-1"
                  style={{
                    border: "1px solid rgba(196,162,74,0.1)",
                    color: "var(--muted)",
                    fontSize: "0.55rem",
                  }}
                >
                  {m}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-center gap-2 mt-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--gold-700)" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span style={{ color: "var(--muted)", fontSize: "0.65rem" }}>
                Transaksi aman & terenkripsi SSL
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
