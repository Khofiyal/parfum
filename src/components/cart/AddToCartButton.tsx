// src/components/cart/AddToCartButton.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { addToCart } from "@/lib/actions/cart";

interface Props {
  productId: string;
  isLoggedIn: boolean;
  isOutOfStock: boolean;
}

export function AddToCartButton({ productId, isLoggedIn, isOutOfStock }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const handleAdd = () => {
    if (!isLoggedIn) {
      router.push("/auth/login?callbackUrl=/cart");
      return;
    }

    startTransition(async () => {
      const result = await addToCart({ productId, quantity });
      if (result.success) {
        setFeedback({ type: "success", msg: "Ditambahkan ke keranjang!" });
        setTimeout(() => setFeedback(null), 3000);
      } else {
        setFeedback({ type: "error", msg: result.error ?? "Gagal menambahkan" });
        setTimeout(() => setFeedback(null), 3000);
      }
    });
  };

  if (isOutOfStock) {
    return (
      <button
        disabled
        className="flex-1 label py-3"
        style={{
          background: "var(--obsidian-700)",
          color: "var(--muted)",
          cursor: "not-allowed",
          fontSize: "0.65rem",
          letterSpacing: "0.15em",
        }}
      >
        Stok Habis
      </button>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-3">
      {/* Quantity selector */}
      <div className="flex items-center gap-3">
        <span className="label" style={{ color: "var(--muted)", fontSize: "0.6rem" }}>
          Jumlah
        </span>
        <div
          className="flex items-center"
          style={{ border: "1px solid rgba(196,162,74,0.15)" }}
        >
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex items-center justify-center w-8 h-8 transition-colors hover:bg-obsidian-800"
            style={{ color: "var(--muted-light)" }}
            aria-label="Kurangi"
          >
            −
          </button>
          <span
            className="w-10 text-center"
            style={{ color: "var(--ivory-200)", fontSize: "0.85rem" }}
          >
            {quantity}
          </span>
          <button
            onClick={() => setQuantity((q) => Math.min(10, q + 1))}
            className="flex items-center justify-center w-8 h-8 transition-colors hover:bg-obsidian-800"
            style={{ color: "var(--muted-light)" }}
            aria-label="Tambah"
          >
            +
          </button>
        </div>
      </div>

      {/* Add button */}
      <Button
        variant="primary"
        size="lg"
        isLoading={isPending}
        onClick={handleAdd}
        className="w-full"
        style={{ minHeight: "48px" }}
      >
        {isLoggedIn ? "Tambah ke Keranjang" : "Masuk untuk Membeli"}
      </Button>

      {/* Feedback */}
      {feedback && (
        <div
          className="flex items-center gap-2 p-3 animate-fade-in"
          style={{
            background:
              feedback.type === "success"
                ? "rgba(34,197,94,0.08)"
                : "rgba(239,68,68,0.08)",
            border: `1px solid ${feedback.type === "success" ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
          }}
        >
          <span style={{ fontSize: "0.8rem" }}>
            {feedback.type === "success" ? "✓" : "✕"}
          </span>
          <span
            style={{
              color:
                feedback.type === "success" ? "#4ade80" : "#f87171",
              fontSize: "0.78rem",
            }}
          >
            {feedback.msg}
          </span>
        </div>
      )}
    </div>
  );
}
