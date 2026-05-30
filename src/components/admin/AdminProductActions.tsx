// src/components/admin/AdminProductActions.tsx
"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteProduct, updateProduct } from "@/lib/actions/admin";

export function AdminProductActions({
  productId,
  isActive,
}: {
  productId: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      // Soft toggle via updateProduct — set isActive
      // For simplicity we use a direct approach
      const { prisma } = await import("@/lib/db/prisma");
      await prisma.product.update({
        where: { id: productId },
        data: { isActive: !isActive },
      });
      router.refresh();
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className="label px-3 py-1.5 transition-all"
      style={{
        border: isActive
          ? "1px solid rgba(239,68,68,0.2)"
          : "1px solid rgba(34,197,94,0.2)",
        color: isActive ? "rgba(248,113,113,0.7)" : "rgba(74,222,128,0.7)",
        fontSize: "0.58rem",
        cursor: isPending ? "not-allowed" : "pointer",
        opacity: isPending ? 0.6 : 1,
        background: "transparent",
      }}
    >
      {isPending ? "..." : isActive ? "Nonaktifkan" : "Aktifkan"}
    </button>
  );
}
