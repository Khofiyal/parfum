// src/components/admin/ProductForm.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@prisma/client";
import { createProduct, updateProduct } from "@/lib/actions/admin";
import { Button } from "@/components/ui/Button";

const CATEGORIES = ["floral","woody","oriental","fresh","citrus","gourmand","chypre","fougere","aquatic"];
const SIZES = ["10ml","15ml","30ml","50ml","75ml","100ml","125ml","150ml","200ml"];
const CONCENTRATIONS = ["Parfum","EDP","EDT","EDC","Splash"];
const GENDERS = ["unisex","masculine","feminine"];

interface Props {
  product?: Product | null;
}

function slugify(text: string) {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim().replace(/\s+/g, "-");
}

export function ProductForm({ product }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    brand: product?.brand ?? "",
    description: product?.description ?? "",
    price: product?.price ? Number(product.price) : 0,
    stock: product?.stock ?? 0,
    imageUrls: (product?.imageUrls as string[]) ?? [""],
    topNotes: ((product?.topNotes as string[]) ?? [""]).join(", "),
    middleNotes: ((product?.middleNotes as string[]) ?? [""]).join(", "),
    baseNotes: ((product?.baseNotes as string[]) ?? [""]).join(", "),
    category: product?.category ?? "floral",
    size: product?.size ?? "50ml",
    concentration: product?.concentration ?? "EDP",
    gender: product?.gender ?? "unisex",
    isActive: product?.isActive ?? true,
    isFeatured: product?.isFeatured ?? false,
  });

  const set = (k: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const val = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
    setForm((f) => ({
      ...f,
      [k]: val,
      ...(k === "name" && !product ? { slug: slugify(String(val)) } : {}),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);
    setErrors({});

    const data = {
      ...form,
      imageUrls: form.imageUrls.filter(Boolean),
      topNotes: form.topNotes.split(",").map((s) => s.trim()).filter(Boolean),
      middleNotes: form.middleNotes.split(",").map((s) => s.trim()).filter(Boolean),
      baseNotes: form.baseNotes.split(",").map((s) => s.trim()).filter(Boolean),
      price: Number(form.price),
      stock: Number(form.stock),
    };

    startTransition(async () => {
      const result = product
        ? await updateProduct(product.id, data)
        : await createProduct(data);

      if (!result.success) {
        if (result.fieldErrors) {
          const errs: Record<string, string> = {};
          Object.entries(result.fieldErrors).forEach(([k, msgs]) => {
            if (msgs?.[0]) errs[k] = msgs[0];
          });
          setErrors(errs);
        } else {
          setGlobalError(result.error ?? "Gagal menyimpan produk");
        }
        return;
      }

      router.push("/admin/products");
      router.refresh();
    });
  };

  const inputClass = "input-dark";
  const inputStyle = (err?: string): React.CSSProperties => ({
    borderColor: err ? "rgba(239,68,68,0.5)" : undefined,
  });

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-8">
      <p className="label mb-5" style={{ color: "var(--gold-500)", fontSize: "0.62rem" }}>
        {title}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
    </div>
  );

  const Field = ({ label, span = 1, error, children }: {
    label: string; span?: 1 | 2; error?: string; children: React.ReactNode;
  }) => (
    <div className={span === 2 ? "sm:col-span-2" : ""}>
      <label className="label block mb-1.5" style={{ color: "var(--muted-light)", fontSize: "0.6rem" }}>
        {label}
      </label>
      {children}
      {error && <p style={{ color: "#f87171", fontSize: "0.72rem", marginTop: "4px" }}>{error}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} noValidate>
      {globalError && (
        <div className="p-3 mb-6" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <p style={{ color: "#f87171", fontSize: "0.8rem" }}>{globalError}</p>
        </div>
      )}

      <Section title="Informasi Dasar">
        <Field label="Nama Produk *" error={errors["name"]}>
          <input value={form.name} onChange={set("name")} className={inputClass} style={inputStyle(errors["name"])} />
        </Field>

        <Field label="Brand *" error={errors["brand"]}>
          <input value={form.brand} onChange={set("brand")} className={inputClass} style={inputStyle(errors["brand"])} placeholder="Chanel, Dior, YSL..." />
        </Field>

        <Field label="Slug (URL) *" error={errors["slug"]}>
          <input value={form.slug} onChange={set("slug")} className={inputClass} style={inputStyle(errors["slug"])} placeholder="nama-produk-brand" />
        </Field>

        <Field label="Konsentrasi *">
          <select value={form.concentration} onChange={set("concentration")} className={inputClass} style={{ cursor: "pointer" }}>
            {CONCENTRATIONS.map((c) => <option key={c} value={c} style={{ background: "var(--obsidian-800)" }}>{c}</option>)}
          </select>
        </Field>

        <Field label="Deskripsi *" span={2} error={errors["description"]}>
          <textarea value={form.description} onChange={set("description")} rows={5}
            className={inputClass} style={{ resize: "vertical", ...inputStyle(errors["description"]) }} />
        </Field>
      </Section>

      <Section title="Harga & Stok">
        <Field label="Harga (Rp) *" error={errors["price"]}>
          <input type="number" value={form.price} onChange={set("price")} className={inputClass}
            min={0} style={inputStyle(errors["price"])} />
        </Field>

        <Field label="Stok *" error={errors["stock"]}>
          <input type="number" value={form.stock} onChange={set("stock")} className={inputClass}
            min={0} style={inputStyle(errors["stock"])} />
        </Field>
      </Section>

      <Section title="Klasifikasi">
        <Field label="Kategori *">
          <select value={form.category} onChange={set("category")} className={inputClass} style={{ cursor: "pointer" }}>
            {CATEGORIES.map((c) => <option key={c} value={c} style={{ background: "var(--obsidian-800)" }}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
        </Field>

        <Field label="Ukuran *">
          <select value={form.size} onChange={set("size")} className={inputClass} style={{ cursor: "pointer" }}>
            {SIZES.map((s) => <option key={s} value={s} style={{ background: "var(--obsidian-800)" }}>{s}</option>)}
          </select>
        </Field>

        <Field label="Gender *">
          <select value={form.gender} onChange={set("gender")} className={inputClass} style={{ cursor: "pointer" }}>
            {GENDERS.map((g) => <option key={g} value={g} style={{ background: "var(--obsidian-800)" }}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>)}
          </select>
        </Field>
      </Section>

      <Section title="Komposisi Aroma">
        <Field label="Top Notes (pisah koma) *" error={errors["topNotes"]}>
          <input value={form.topNotes} onChange={set("topNotes")} className={inputClass}
            placeholder="Bergamot, Lemon, Pink Pepper" style={inputStyle(errors["topNotes"])} />
        </Field>

        <Field label="Heart Notes (pisah koma) *" error={errors["middleNotes"]}>
          <input value={form.middleNotes} onChange={set("middleNotes")} className={inputClass}
            placeholder="Rose, Jasmine, Iris" style={inputStyle(errors["middleNotes"])} />
        </Field>

        <Field label="Base Notes (pisah koma) *" error={errors["baseNotes"]}>
          <input value={form.baseNotes} onChange={set("baseNotes")} className={inputClass}
            placeholder="Sandalwood, Musk, Amber" style={inputStyle(errors["baseNotes"])} />
        </Field>
      </Section>

      <div className="mb-8">
        <p className="label mb-5" style={{ color: "var(--gold-500)", fontSize: "0.62rem" }}>
          Foto Produk
        </p>
        <div className="flex flex-col gap-2">
          {form.imageUrls.map((url, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={url}
                onChange={(e) => {
                  const newUrls = [...form.imageUrls];
                  newUrls[i] = e.target.value;
                  setForm((f) => ({ ...f, imageUrls: newUrls }));
                }}
                className={inputClass}
                placeholder={`URL foto ${i + 1} (dari R2)`}
                style={{ flex: 1 }}
              />
              {form.imageUrls.length > 1 && (
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, imageUrls: f.imageUrls.filter((_, j) => j !== i) }))}
                  style={{ color: "#f87171", fontSize: "0.9rem", background: "none", border: "none", cursor: "pointer", flexShrink: 0 }}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          {form.imageUrls.length < 10 && (
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, imageUrls: [...f.imageUrls, ""] }))}
              className="label text-left transition-colors hover:text-gold-400"
              style={{ color: "var(--muted)", fontSize: "0.6rem", background: "none", border: "none", cursor: "pointer" }}
            >
              + Tambah URL foto
            </button>
          )}
        </div>
      </div>

      {/* Toggles */}
      <div className="flex flex-wrap gap-6 mb-8">
        {[
          { key: "isActive" as const, label: "Produk Aktif (tampil di katalog)" },
          { key: "isFeatured" as const, label: "Featured (tampil di halaman utama)" },
        ].map((item) => (
          <label key={item.key} className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form[item.key] as boolean}
              onChange={(e) => setForm((f) => ({ ...f, [item.key]: e.target.checked }))}
            />
            <span style={{ color: "var(--muted-light)", fontSize: "0.82rem" }}>{item.label}</span>
          </label>
        ))}
      </div>

      {/* Submit */}
      <div className="flex gap-3">
        <Button type="submit" variant="primary" size="lg" isLoading={isPending}>
          {product ? "Simpan Perubahan" : "Tambah Produk"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Batal
        </Button>
      </div>
    </form>
  );
}
