// src/components/checkout/MidtransSnap.tsx
"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    snap?: {
      pay: (
        snapToken: string,
        options: {
          onSuccess: (result: { order_id: string; transaction_status: string }) => void;
          onPending: (result: { order_id: string }) => void;
          onError: (result: unknown) => void;
          onClose: () => void;
        }
      ) => void;
    };
  }
}

interface Props {
  snapToken: string;
  orderId: string;
  onClose?: () => void;
}

export function MidtransSnap({ snapToken, orderId, onClose }: Props) {
  const router = useRouter();
  const IS_PRODUCTION = process.env.NEXT_PUBLIC_MIDTRANS_ENV === "production";

  const SNAP_URL = IS_PRODUCTION
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";

  const CLIENT_KEY = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? "";

  const openSnap = useCallback(() => {
    if (!window.snap) return;

    window.snap.pay(snapToken, {
      onSuccess: () => {
        router.push(`/orders/${orderId}?status=success`);
      },
      onPending: () => {
        router.push(`/orders/${orderId}?status=pending`);
      },
      onError: () => {
        router.push(`/orders/${orderId}?status=error`);
      },
      onClose: () => {
        onClose?.();
        router.push(`/orders/${orderId}`);
      },
    });
  }, [snapToken, orderId, router, onClose]);

  useEffect(() => {
    // Load Midtrans Snap.js script sekali
    const existingScript = document.getElementById("midtrans-snap");
    if (existingScript) {
      openSnap();
      return;
    }

    const script = document.createElement("script");
    script.id = "midtrans-snap";
    script.src = SNAP_URL;
    script.setAttribute("data-client-key", CLIENT_KEY);
    script.async = true;
    script.onload = openSnap;
    document.body.appendChild(script);

    return () => {
      // Jangan hapus script supaya tidak reload ulang
    };
  }, [SNAP_URL, CLIENT_KEY, openSnap]);

  // Komponen ini invisible — hanya load script dan trigger popup
  return null;
}
