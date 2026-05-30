// src/components/checkout/PayAgainButton.tsx
"use client";

import { useState } from "react";
import { MidtransSnap } from "./MidtransSnap";
import { useRouter } from "next/navigation";

export function PayAgainButton({ snapToken, orderId }: { snapToken: string; orderId: string }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {isOpen && (
        <MidtransSnap
          snapToken={snapToken}
          orderId={orderId}
          onClose={() => {
            setIsOpen(false);
            router.refresh();
          }}
        />
      )}
      <button
        onClick={() => setIsOpen(true)}
        className="label py-3 w-full transition-all"
        style={{
          background: "var(--gold-600)",
          color: "var(--obsidian-950)",
          fontSize: "0.62rem",
          cursor: "pointer",
          border: "none",
        }}
      >
        Bayar Sekarang
      </button>
    </>
  );
}
