// src/components/checkout/AddressListClient.tsx
"use client";

import { useState, useTransition } from "react";
import type { Address } from "@prisma/client";
import { deleteAddress, setDefaultAddress } from "@/lib/actions/addresses";
import { AddressForm } from "./AddressForm";
import { Button } from "@/components/ui/Button";

interface Props {
  initialAddresses: Address[];
}

export function AddressListClient({ initialAddresses }: Props) {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setDeletingId(id);
    startTransition(async () => {
      await deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      setDeletingId(null);
    });
  };

  const handleSetDefault = (id: string) => {
    startTransition(async () => {
      await setDefaultAddress(id);
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, isDefault: a.id === id }))
      );
    });
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingId(null);
    // Refresh via hard reload to get updated list from server
    window.location.reload();
  };

  return (
    <div>
      {/* Add new button */}
      {!showForm && (
        <div className="mb-6">
          <Button variant="secondary" onClick={() => setShowForm(true)}>
            + Tambah Alamat Baru
          </Button>
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <div
          className="p-5 mb-6 animate-fade-in"
          style={{ background: "var(--obsidian-900)", border: "1px solid rgba(196,162,74,0.12)" }}
        >
          <p className="font-display text-xl mb-5" style={{ color: "var(--ivory-200)" }}>
            Tambah Alamat Baru
          </p>
          <AddressForm
            onSuccess={handleFormSuccess}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Empty state */}
      {addresses.length === 0 && !showForm && (
        <div
          className="flex flex-col items-center justify-center py-16 text-center"
          style={{ border: "1px dashed rgba(196,162,74,0.12)" }}
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--muted)"
            strokeWidth="1"
            className="mb-4"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <p style={{ color: "var(--muted-light)", marginBottom: "16px" }}>
            Belum ada alamat tersimpan
          </p>
          <Button variant="primary" onClick={() => setShowForm(true)}>
            Tambah Alamat Pertama
          </Button>
        </div>
      )}

      {/* Address list */}
      <div className="flex flex-col gap-4">
        {addresses.map((addr) => (
          <div key={addr.id}>
            {editingId === addr.id ? (
              <div
                className="p-5 animate-fade-in"
                style={{ background: "var(--obsidian-900)", border: "1px solid rgba(196,162,74,0.12)" }}
              >
                <p className="font-display text-xl mb-5" style={{ color: "var(--ivory-200)" }}>
                  Edit Alamat
                </p>
                <AddressForm
                  existing={addr}
                  onSuccess={handleFormSuccess}
                  onCancel={() => setEditingId(null)}
                />
              </div>
            ) : (
              <div
                className="p-5 transition-all duration-200"
                style={{
                  background: "var(--obsidian-900)",
                  border: addr.isDefault
                    ? "1px solid rgba(196,162,74,0.25)"
                    : "1px solid rgba(196,162,74,0.08)",
                  opacity: deletingId === addr.id ? 0.4 : 1,
                  pointerEvents: deletingId === addr.id ? "none" : "auto",
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-display text-lg" style={{ color: "var(--ivory-200)" }}>
                        {addr.label}
                      </span>
                      {addr.isDefault && (
                        <span
                          className="label px-2 py-0.5"
                          style={{
                            background: "rgba(196,162,74,0.1)",
                            color: "var(--gold-500)",
                            fontSize: "0.55rem",
                          }}
                        >
                          Utama
                        </span>
                      )}
                    </div>
                    <p style={{ color: "var(--ivory-300)", fontSize: "0.85rem", marginBottom: "3px" }}>
                      {addr.recipientName} · {addr.phone}
                    </p>
                    <p style={{ color: "var(--muted-light)", fontSize: "0.8rem", lineHeight: 1.6 }}>
                      {addr.fullAddress}
                      <br />
                      {addr.city}, {addr.province} {addr.postalCode}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => setEditingId(addr.id)}
                      className="label px-3 py-1.5 transition-colors hover:text-gold-400"
                      style={{
                        border: "1px solid rgba(196,162,74,0.15)",
                        color: "var(--muted-light)",
                        fontSize: "0.58rem",
                      }}
                    >
                      Edit
                    </button>
                    {!addr.isDefault && (
                      <button
                        onClick={() => handleSetDefault(addr.id)}
                        disabled={isPending}
                        className="label px-3 py-1.5 transition-colors hover:text-gold-400"
                        style={{
                          border: "1px solid rgba(196,162,74,0.15)",
                          color: "var(--muted)",
                          fontSize: "0.58rem",
                          cursor: isPending ? "not-allowed" : "pointer",
                        }}
                      >
                        Set Utama
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(addr.id)}
                      className="label px-3 py-1.5 transition-colors hover:text-red-400"
                      style={{
                        border: "1px solid rgba(239,68,68,0.15)",
                        color: "rgba(248,113,113,0.6)",
                        fontSize: "0.58rem",
                      }}
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
