// src/components/checkout/CancelOrderButton.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelOrder } from "@/lib/actions/orders";

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleCancel = () => {
    startTransition(async () => {
      const res = await cancelOrder(orderId);
      if (res.success) {
        router.refresh();
      }
    });
  };

  if (showConfirm) {
    return (
      <div
        className="p-4 animate-fade-in"
        style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}
      >
        <p style={{ color: "var(--ivory-300)", fontSize: "0.82rem", marginBottom: "12px" }}>
          Yakin ingin membatalkan pesanan ini?
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleCancel}
            disabled={isPending}
            className="label flex-1 py-2.5 transition-all"
            style={{
              background: "rgba(239,68,68,0.2)",
              border: "1px solid rgba(239,68,68,0.4)",
              color: "#f87171",
              fontSize: "0.6rem",
              cursor: isPending ? "not-allowed" : "pointer",
              opacity: isPending ? 0.6 : 1,
            }}
          >
            {isPending ? "Membatalkan..." : "Ya, Batalkan"}
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            className="label flex-1 py-2.5 transition-all"
            style={{
              border: "1px solid rgba(196,162,74,0.15)",
              color: "var(--muted-light)",
              fontSize: "0.6rem",
              cursor: "pointer",
            }}
          >
            Tidak
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="label py-3 w-full transition-all"
      style={{
        border: "1px solid rgba(239,68,68,0.2)",
        color: "#f87171",
        fontSize: "0.62rem",
        background: "transparent",
        cursor: "pointer",
      }}
    >
      Batalkan Pesanan
    </button>
  );
}
