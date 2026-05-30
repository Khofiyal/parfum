// src/components/cart/CartItemRow.tsx
"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { updateCartQuantity, removeFromCart } from "@/lib/actions/cart";

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    brand: string;
    price: number;   // sudah di-serialize dari server
    stock: number;
    imageUrls: unknown;
    size: string;
    concentration: string;
    isActive: boolean;
  };
}

interface Props {
  item: CartItem;
}

export function CartItemRow({ item }: Props) {
  const [isPending, startTransition] = useTransition();
  const [quantity, setQuantity] = useState(item.quantity);

  const price = item.product.price; // sudah number

  const imageUrls = item.product.imageUrls as string[];
  const primaryImage = imageUrls[0] ?? "/placeholder-product.jpg";

  const formatPrice = (n: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(n);

  const handleQuantityChange = (newQty: number) => {
    if (newQty < 1 || newQty > Math.min(10, item.product.stock)) return;
    setQuantity(newQty);
    startTransition(async () => {
      await updateCartQuantity(item.product.id, newQty);
    });
  };

  const handleRemove = () => {
    startTransition(async () => {
      await removeFromCart(item.product.id);
    });
  };

  return (
    <div
      className="grid grid-cols-12 gap-4 items-center py-5 transition-opacity duration-200"
      style={{
        borderBottom: "1px solid rgba(196,162,74,0.06)",
        opacity: isPending ? 0.5 : 1,
        pointerEvents: isPending ? "none" : "auto",
      }}
    >
      {/* Product (image + name) — 6 cols */}
      <div className="col-span-12 md:col-span-6 flex items-center gap-4">
        <Link
          href={`/products/${item.product.slug}`}
          className="relative flex-shrink-0 overflow-hidden"
          style={{
            width: "72px",
            height: "90px",
            background: "var(--obsidian-900)",
            border: "1px solid rgba(196,162,74,0.08)",
          }}
        >
          <Image
            src={primaryImage}
            alt={item.product.name}
            fill
            className="object-cover"
            sizes="72px"
          />
        </Link>

        <div>
          <p
            className="label mb-1"
            style={{ color: "var(--muted)", fontSize: "0.58rem" }}
          >
            {item.product.brand}
          </p>
          <Link
            href={`/products/${item.product.slug}`}
            className="font-display text-lg hover:text-gold-400 transition-colors"
            style={{ color: "var(--ivory-200)", display: "block" }}
          >
            {item.product.name}
          </Link>
          <p
            className="label mt-1"
            style={{ color: "var(--muted)", fontSize: "0.58rem" }}
          >
            {item.product.size} · {item.product.concentration}
          </p>

          {/* Mobile: price + remove */}
          <div className="flex items-center gap-4 mt-2 md:hidden">
            <span style={{ color: "var(--gold-400)", fontSize: "0.85rem" }}>
              {formatPrice(price)}
            </span>
            <button
              onClick={handleRemove}
              style={{ color: "var(--muted)", fontSize: "0.72rem" }}
              className="hover:text-red-400 transition-colors"
            >
              Hapus
            </button>
          </div>
        </div>
      </div>

      {/* Price — 2 cols, desktop */}
      <div className="hidden md:block col-span-2 text-center">
        <span style={{ color: "var(--ivory-300)", fontSize: "0.85rem" }}>
          {formatPrice(price)}
        </span>
      </div>

      {/* Quantity — 2 cols */}
      <div className="col-span-6 md:col-span-2 flex items-center justify-center">
        <div
          className="flex items-center"
          style={{ border: "1px solid rgba(196,162,74,0.15)" }}
        >
          <button
            onClick={() => handleQuantityChange(quantity - 1)}
            className="flex items-center justify-center w-8 h-8 transition-colors hover:bg-obsidian-800"
            style={{ color: "var(--muted-light)" }}
            aria-label="Kurangi"
          >
            −
          </button>
          <span
            className="w-8 text-center"
            style={{ color: "var(--ivory-200)", fontSize: "0.85rem" }}
          >
            {quantity}
          </span>
          <button
            onClick={() => handleQuantityChange(quantity + 1)}
            className="flex items-center justify-center w-8 h-8 transition-colors hover:bg-obsidian-800"
            style={{ color: "var(--muted-light)" }}
            disabled={quantity >= item.product.stock}
            aria-label="Tambah"
          >
            +
          </button>
        </div>
      </div>

      {/* Total & remove — 2 cols, desktop */}
      <div className="hidden md:flex col-span-2 items-center justify-end gap-3">
        <span style={{ color: "var(--gold-400)", fontSize: "0.9rem" }}>
          {formatPrice(price * quantity)}
        </span>
        <button
          onClick={handleRemove}
          className="transition-colors hover:text-red-400 p-1"
          style={{ color: "var(--muted)" }}
          aria-label="Hapus dari keranjang"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
        </button>
      </div>

      {/* Mobile total */}
      <div className="col-span-6 md:hidden text-right">
        <span style={{ color: "var(--gold-400)", fontSize: "0.85rem" }}>
          {formatPrice(price * quantity)}
        </span>
      </div>
    </div>
  );
}
