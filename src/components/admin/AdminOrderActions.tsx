// src/components/admin/AdminOrderActions.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatus } from "@/lib/actions/admin";

const NEXT_STATUS: Record<string, string | null> = {
  PENDING:    "PROCESSING",
  PROCESSING: "SHIPPED",
  SHIPPED:    "DELIVERED",
  DELIVERED:  null,
  CANCELLED:  null,
  REFUNDED:   null,
};

const NEXT_LABEL: Record<string, string> = {
  PROCESSING: "Proses",
  SHIPPED:    "Kirim",
  DELIVERED:  "Konfirmasi Terima",
};

export function AdminOrderActions({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const nextStatus = NEXT_STATUS[currentStatus];

  if (!nextStatus) return null;

  const handleUpdate = () => {
    startTransition(async () => {
      await updateOrderStatus(orderId, nextStatus);
      router.refresh();
    });
  };

  return (
    <button
      onClick={handleUpdate}
      disabled={isPending}
      className="label px-3 py-1.5 transition-all"
      style={{
        background: "rgba(196,162,74,0.1)",
        border: "1px solid rgba(196,162,74,0.3)",
        color: "var(--gold-400)",
        fontSize: "0.58rem",
        cursor: isPending ? "not-allowed" : "pointer",
        opacity: isPending ? 0.6 : 1,
      }}
    >
      {isPending ? "..." : NEXT_LABEL[nextStatus] ?? nextStatus}
    </button>
  );
}
