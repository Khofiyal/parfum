// src/components/auth/RegisterForm.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { registerSchema } from "@/lib/validations/auth";
import type { z } from "zod";

type RegisterFields = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [fields, setFields] = useState<RegisterFields>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterFields, string>>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const setField = (key: keyof RegisterFields) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFields((f) => ({ ...f, [key]: e.target.value }));

  const validate = (): boolean => {
    const result = registerSchema.safeParse(fields);
    if (!result.success) {
      const errs: Partial<Record<keyof RegisterFields, string>> = {};
      result.error.errors.forEach((e) => {
        const path = e.path[0] as keyof RegisterFields;
        if (path && !errs[path]) errs[path] = e.message;
      });
      setErrors(errs);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setGlobalError(null);

    startTransition(async () => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fields.name,
          email: fields.email,
          password: fields.password,
          confirmPassword: fields.confirmPassword,
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string; fieldErrors?: Record<string, string[]> };
        if (data.fieldErrors) {
          const errs: Partial<Record<keyof RegisterFields, string>> = {};
          Object.entries(data.fieldErrors).forEach(([key, msgs]) => {
            errs[key as keyof RegisterFields] = msgs[0];
          });
          setErrors(errs);
        } else {
          setGlobalError(data.error ?? "Terjadi kesalahan. Coba lagi.");
        }
        return;
      }

      // Auto login setelah register
      await signIn("credentials", {
        email: fields.email,
        password: fields.password,
        redirect: false,
      });

      router.push("/");
      router.refresh();
    });
  };

  // Password strength indicator
  const getStrength = (pwd: string): { level: number; label: string; color: string } => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;
    const map = [
      { level: 0, label: "", color: "transparent" },
      { level: 1, label: "Lemah", color: "#f87171" },
      { level: 2, label: "Cukup", color: "#facc15" },
      { level: 3, label: "Baik", color: "#4ade80" },
      { level: 4, label: "Kuat", color: "#22c55e" },
    ];
    return map[score] ?? map[0]!;
  };

  const strength = getStrength(fields.password);

  const FieldInput = ({
    name,
    label,
    type = "text",
    placeholder,
    autoComplete,
    right,
  }: {
    name: keyof RegisterFields;
    label: string;
    type?: string;
    placeholder?: string;
    autoComplete?: string;
    right?: React.ReactNode;
  }) => (
    <div className="flex flex-col gap-2">
      <label className="label" style={{ color: "var(--muted-light)", fontSize: "0.6rem" }}>
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          value={fields[name]}
          onChange={setField(name)}
          onBlur={validate}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="input-dark"
          style={{
            borderColor: errors[name] ? "rgba(239,68,68,0.5)" : undefined,
            paddingRight: right ? "44px" : undefined,
          }}
          aria-invalid={!!errors[name]}
        />
        {right && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{right}</div>
        )}
      </div>
      {errors[name] && (
        <p style={{ color: "#f87171", fontSize: "0.72rem" }}>{errors[name]}</p>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} noValidate>
      {globalError && (
        <div
          className="flex items-start gap-2 p-3 mb-6"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
        >
          <p style={{ color: "#f87171", fontSize: "0.8rem" }}>{globalError}</p>
        </div>
      )}

      <div className="flex flex-col gap-5">
        <FieldInput name="name" label="Nama Lengkap" placeholder="Nama Anda" autoComplete="name" />
        <FieldInput name="email" label="Alamat Email" type="email" placeholder="nama@email.com" autoComplete="email" />

        <div className="flex flex-col gap-2">
          <label className="label" style={{ color: "var(--muted-light)", fontSize: "0.6rem" }}>
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={fields.password}
              onChange={setField("password")}
              onBlur={validate}
              placeholder="Min. 8 karakter"
              autoComplete="new-password"
              className="input-dark"
              style={{
                borderColor: errors.password ? "rgba(239,68,68,0.5)" : undefined,
                paddingRight: "44px",
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--muted)", lineHeight: 0 }}
              aria-label="Toggle password visibility"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                {showPassword ? (
                  <>
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </>
                ) : (
                  <>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </>
                )}
              </svg>
            </button>
          </div>

          {/* Password strength */}
          {fields.password && (
            <div className="flex items-center gap-3">
              <div className="flex gap-1 flex-1">
                {[1, 2, 3, 4].map((lvl) => (
                  <div
                    key={lvl}
                    className="h-1 flex-1 transition-all duration-300"
                    style={{
                      background: lvl <= strength.level ? strength.color : "var(--obsidian-600)",
                    }}
                  />
                ))}
              </div>
              <span style={{ color: strength.color, fontSize: "0.65rem", minWidth: "36px" }}>
                {strength.label}
              </span>
            </div>
          )}
          {errors.password && (
            <p style={{ color: "#f87171", fontSize: "0.72rem" }}>{errors.password}</p>
          )}
        </div>

        <FieldInput
          name="confirmPassword"
          label="Konfirmasi Password"
          type={showPassword ? "text" : "password"}
          placeholder="Ulangi password"
          autoComplete="new-password"
        />

        <button
          type="submit"
          disabled={isPending}
          className="label py-3.5 w-full transition-all duration-200 flex items-center justify-center gap-2 mt-2"
          style={{
            background: "var(--gold-600)",
            color: "var(--obsidian-950)",
            fontSize: "0.65rem",
            letterSpacing: "0.18em",
            cursor: isPending ? "not-allowed" : "pointer",
            opacity: isPending ? 0.7 : 1,
          }}
        >
          {isPending && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              style={{ animation: "spin 0.8s linear infinite" }}>
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          )}
          {isPending ? "Mendaftarkan..." : "Buat Akun"}
        </button>

        <p className="text-xs text-center" style={{ color: "var(--muted)", fontSize: "0.7rem" }}>
          Dengan mendaftar, Anda menyetujui{" "}
          <Link href="/terms" style={{ color: "var(--gold-500)" }}>
            Syarat & Ketentuan
          </Link>{" "}
          dan{" "}
          <Link href="/privacy" style={{ color: "var(--gold-500)" }}>
            Kebijakan Privasi
          </Link>{" "}
          kami.
        </p>
      </div>

      <p className="text-center mt-8" style={{ color: "var(--muted)", fontSize: "0.8rem" }}>
        Sudah punya akun?{" "}
        <Link href="/auth/login" style={{ color: "var(--gold-500)" }} className="hover:text-gold-400">
          Masuk
        </Link>
      </p>
    </form>
  );
}
