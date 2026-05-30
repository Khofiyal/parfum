// src/components/admin/AdminOrderStatusForm.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatus, updateOrderTracking } from "@/lib/actions/admin";
import { Button } from "@/components/ui/Button";

const STATUSES = [
  { value: "PENDING",    label: "Menunggu Pembayaran" },
  { value: "PROCESSING", label: "Diproses" },
  { value: "SHIPPED",    label: "Dikirim" },
  { value: "DELIVERED",  label: "Diterima" },
  { value: "CANCELLED",  label: "Dibatalkan" },
  { value: "REFUNDED",   label: "Dikembalikan" },
];

const COURIERS = ["JNE", "J&T", "SiCepat", "Anteraja", "Ninja Express", "GoSend", "Grab Express", "TIKI"];

interface Props {
  orderId: string;
  currentStatus: string;
  currentTracking: string;
  currentCourier: string;
}

export function AdminOrderStatusForm({ orderId, currentStatus, currentTracking, currentCourier }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState(currentStatus);
  const [trackingNumber, setTrackingNumber] = useState(currentTracking);
  const [courier, setCourier] = useState(currentCourier);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  const handleStatusUpdate = () => {
    startTransition(async () => {
      const res = await updateOrderStatus(orderId, status);
      setFeedback({ ok: res.success, msg: res.success ? "Status berhasil diupdate" : res.error ?? "Gagal" });
      if (res.success) router.refresh();
      setTimeout(() => setFeedback(null), 3000);
    });
  };

  const handleTrackingUpdate = () => {
    if (!trackingNumber.trim() || !courier.trim()) {
      setFeedback({ ok: false, msg: "No. resi dan kurir wajib diisi" });
      return;
    }
    startTransition(async () => {
      const res = await updateOrderTracking(orderId, { trackingNumber, shippingCourier: courier });
      setFeedback({ ok: res.success, msg: res.success ? "Resi berhasil disimpan & status → Dikirim" : res.error ?? "Gagal" });
      if (res.success) router.refresh();
      setTimeout(() => setFeedback(null), 3000);
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Status update */}
      <div>
        <p className="label mb-3" style={{ color: "var(--muted-light)", fontSize: "0.6rem" }}>
          Status Pesanan
        </p>
        <div className="flex gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="input-dark flex-1"
            style={{ cursor: "pointer", fontSize: "0.82rem" }}
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value} style={{ background: "var(--obsidian-800)" }}>
                {s.label}
              </option>
            ))}
          </select>
          <Button
            variant="secondary"
            size="sm"
            isLoading={isPending}
            onClick={handleStatusUpdate}
            disabled={status === currentStatus}
          >
            Update
          </Button>
        </div>
      </div>

      {/* Tracking */}
      <div>
        <p className="label mb-3" style={{ color: "var(--muted-light)", fontSize: "0.6rem" }}>
          Nomor Resi Pengiriman
        </p>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <select
              value={courier}
              onChange={(e) => setCourier(e.target.value)}
              className="input-dark"
              style={{ cursor: "pointer", fontSize: "0.82rem", width: "140px", flexShrink: 0 }}
            >
              <option value="" disabled style={{ background: "var(--obsidian-800)" }}>Kurir</option>
              {COURIERS.map((c) => (
                <option key={c} value={c} style={{ background: "var(--obsidian-800)" }}>{c}</option>
              ))}
            </select>
            <input
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Masukkan nomor resi..."
              className="input-dark flex-1"
              style={{ fontSize: "0.82rem" }}
            />
          </div>
          <Button
            variant="primary"
            size="sm"
            isLoading={isPending}
            onClick={handleTrackingUpdate}
          >
            Simpan & Tandai Dikirim
          </Button>
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          className="p-3 animate-fade-in"
          style={{
            background: feedback.ok ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
            border: `1px solid ${feedback.ok ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
          }}
        >
          <p style={{ color: feedback.ok ? "#4ade80" : "#f87171", fontSize: "0.78rem" }}>
            {feedback.ok ? "✓" : "✕"} {feedback.msg}
          </p>
        </div>
      )}
    </div>
  );
}
