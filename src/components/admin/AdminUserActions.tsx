// src/components/admin/AdminUserActions.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { suspendUser, unsuspendUser } from "@/lib/actions/admin";

export function AdminUserActions({
  userId,
  isSuspended,
}: {
  userId: string;
  isSuspended: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleToggle = () => {
    startTransition(async () => {
      if (isSuspended) {
        await unsuspendUser(userId);
      } else {
        await suspendUser(userId);
      }
      setShowConfirm(false);
      router.refresh();
    });
  };

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleToggle}
          disabled={isPending}
          className="label px-2 py-1.5 transition-all"
          style={{
            background: isSuspended ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
            border: isSuspended ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(239,68,68,0.3)",
            color: isSuspended ? "#4ade80" : "#f87171",
            fontSize: "0.58rem",
            cursor: isPending ? "not-allowed" : "pointer",
          }}
        >
          {isPending ? "..." : "Yakin?"}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          className="label px-2 py-1.5"
          style={{
            border: "1px solid rgba(196,162,74,0.15)",
            color: "var(--muted)",
            fontSize: "0.58rem",
            cursor: "pointer",
          }}
        >
          Batal
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="label px-3 py-1.5 transition-all"
      style={{
        border: isSuspended ? "1px solid rgba(34,197,94,0.2)" : "1px solid rgba(239,68,68,0.2)",
        color: isSuspended ? "rgba(74,222,128,0.8)" : "rgba(248,113,113,0.7)",
        fontSize: "0.58rem",
        background: "transparent",
        cursor: "pointer",
      }}
    >
      {isSuspended ? "Aktifkan" : "Suspend"}
    </button>
  );
}
