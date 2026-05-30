// src/components/checkout/AddressForm.tsx
"use client";

import { useState, useTransition } from "react";
import { createAddress, updateAddress } from "@/lib/actions/addresses";
import { Button } from "@/components/ui/Button";
import type { Address } from "@prisma/client";

const PROVINCES = [
  "Aceh","Bali","Banten","Bengkulu","DI Yogyakarta","DKI Jakarta",
  "Gorontalo","Jambi","Jawa Barat","Jawa Tengah","Jawa Timur",
  "Kalimantan Barat","Kalimantan Selatan","Kalimantan Tengah",
  "Kalimantan Timur","Kalimantan Utara","Kepulauan Bangka Belitung",
  "Kepulauan Riau","Lampung","Maluku","Maluku Utara",
  "Nusa Tenggara Barat","Nusa Tenggara Timur","Papua","Papua Barat",
  "Riau","Sulawesi Barat","Sulawesi Selatan","Sulawesi Tengah",
  "Sulawesi Tenggara","Sulawesi Utara","Sumatera Barat",
  "Sumatera Selatan","Sumatera Utara",
];

interface Props {
  existing?: Address;
  onSuccess?: (id?: string) => void;
  onCancel?: () => void;
}

type FieldKey = "label" | "recipientName" | "phone" | "fullAddress" | "city" | "province" | "postalCode";

const INITIAL: Record<FieldKey, string> & { isDefault: boolean } = {
  label: "", recipientName: "", phone: "", fullAddress: "",
  city: "", province: "", postalCode: "", isDefault: false,
};

export function AddressForm({ existing, onSuccess, onCancel }: Props) {
  const [isPending, startTransition] = useTransition();
  const [fields, setFields] = useState<typeof INITIAL>(
    existing
      ? {
          label: existing.label, recipientName: existing.recipientName,
          phone: existing.phone, fullAddress: existing.fullAddress,
          city: existing.city, province: existing.province,
          postalCode: existing.postalCode, isDefault: existing.isDefault,
        }
      : INITIAL
  );
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  const set = (k: FieldKey) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setFields((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);
    startTransition(async () => {
      const result = existing
        ? await updateAddress(existing.id, fields)
        : await createAddress(fields);

      if (!result.success) {
        if (result.fieldErrors) {
          const errs: Partial<Record<FieldKey, string>> = {};
          Object.entries(result.fieldErrors).forEach(([k, msgs]) => {
            if (msgs?.[0]) errs[k as FieldKey] = msgs[0];
          });
          setErrors(errs);
        } else {
          setGlobalError(result.error ?? "Gagal menyimpan alamat");
        }
        return;
      }
      onSuccess?.(result.data?.id);
    });
  };

  const inputStyle = (hasErr?: string): React.CSSProperties => ({
    background: "var(--obsidian-800)",
    border: `1px solid ${hasErr ? "rgba(239,68,68,0.5)" : "rgba(196,162,74,0.12)"}`,
    color: "var(--ivory-200)",
    padding: "10px 14px",
    fontFamily: "var(--font-body)",
    fontSize: "0.85rem",
    fontWeight: 300,
    outline: "none",
    width: "100%",
    transition: "border-color 0.2s",
  });

  const Field = ({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) => (
    <div className="flex flex-col gap-1.5">
      <label className="label" style={{ color: "var(--muted-light)", fontSize: "0.6rem" }}>
        {label}
      </label>
      {children}
      {error && <p style={{ color: "#f87171", fontSize: "0.72rem" }}>{error}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} noValidate>
      {globalError && (
        <div className="p-3 mb-5" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <p style={{ color: "#f87171", fontSize: "0.8rem" }}>{globalError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Label Alamat *" error={errors.label}>
          <input
            value={fields.label}
            onChange={set("label")}
            placeholder="Rumah, Kantor, dll."
            style={inputStyle(errors.label)}
          />
        </Field>

        <Field label="Nama Penerima *" error={errors.recipientName}>
          <input
            value={fields.recipientName}
            onChange={set("recipientName")}
            placeholder="Nama lengkap penerima"
            style={inputStyle(errors.recipientName)}
          />
        </Field>

        <Field label="Nomor Telepon *" error={errors.phone}>
          <input
            value={fields.phone}
            onChange={set("phone")}
            placeholder="08xxxxxxxxxx"
            type="tel"
            style={inputStyle(errors.phone)}
          />
        </Field>

        <Field label="Kode Pos *" error={errors.postalCode}>
          <input
            value={fields.postalCode}
            onChange={set("postalCode")}
            placeholder="12345"
            maxLength={5}
            style={inputStyle(errors.postalCode)}
          />
        </Field>

        <div className="sm:col-span-2">
          <Field label="Alamat Lengkap *" error={errors.fullAddress}>
            <textarea
              value={fields.fullAddress}
              onChange={(e) => setFields((f) => ({ ...f, fullAddress: e.target.value }))}
              placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan"
              rows={3}
              style={{ ...inputStyle(errors.fullAddress), resize: "vertical" }}
            />
          </Field>
        </div>

        <Field label="Kota/Kabupaten *" error={errors.city}>
          <input
            value={fields.city}
            onChange={set("city")}
            placeholder="Jakarta Selatan"
            style={inputStyle(errors.city)}
          />
        </Field>

        <Field label="Provinsi *" error={errors.province}>
          <select
            value={fields.province}
            onChange={set("province")}
            style={{ ...inputStyle(errors.province), cursor: "pointer" }}
          >
            <option value="" disabled style={{ background: "var(--obsidian-800)" }}>
              Pilih provinsi
            </option>
            {PROVINCES.map((p) => (
              <option key={p} value={p} style={{ background: "var(--obsidian-800)" }}>
                {p}
              </option>
            ))}
          </select>
        </Field>

        <div className="sm:col-span-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={fields.isDefault}
              onChange={(e) => setFields((f) => ({ ...f, isDefault: e.target.checked }))}
            />
            <span style={{ color: "var(--muted-light)", fontSize: "0.82rem" }}>
              Jadikan alamat utama
            </span>
          </label>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <Button type="submit" variant="primary" size="md" isLoading={isPending}>
          {existing ? "Simpan Perubahan" : "Tambah Alamat"}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" size="md" onClick={onCancel}>
            Batal
          </Button>
        )}
      </div>
    </form>
  );
}
