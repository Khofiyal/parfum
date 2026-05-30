// src/components/auth/LoginForm.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { loginSchema } from "@/lib/validations/auth";
import type { z } from "zod";

type LoginFields = z.infer<typeof loginSchema>;

const ERROR_MAP: Record<string, string> = {
  CredentialsSignin: "Email atau password salah.",
  OAuthAccountNotLinked: "Email ini sudah terdaftar dengan metode lain. Gunakan Google untuk masuk.",
  OAuthSignin: "Gagal masuk dengan Google. Coba lagi.",
  Default: "Terjadi kesalahan. Silakan coba lagi.",
};

interface Props {
  callbackUrl?: string;
  serverError?: string;
}

export function LoginForm({ callbackUrl = "/", serverError }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isGooglePending, setIsGooglePending] = useState(false);
  const [fields, setFields] = useState<LoginFields>({ email: "", password: "" });
  const [errors, setErrors] = useState<Partial<LoginFields>>({});
  const [globalError, setGlobalError] = useState<string | null>(
    serverError ? (ERROR_MAP[serverError] ?? ERROR_MAP["Default"]!) : null
  );
  const [showPassword, setShowPassword] = useState(false);

  const validate = (): boolean => {
    const result = loginSchema.safeParse(fields);
    if (!result.success) {
      const fieldErrors: Partial<LoginFields> = {};
      result.error.errors.forEach((e) => {
        const path = e.path[0] as keyof LoginFields;
        if (path) fieldErrors[path] = e.message;
      });
      setErrors(fieldErrors);
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
      const res = await signIn("credentials", {
        email: fields.email,
        password: fields.password,
        redirect: false,
      });

      if (res?.error) {
        setGlobalError(ERROR_MAP[res.error] ?? ERROR_MAP["Default"]!);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    });
  };

  const handleGoogle = async () => {
    setIsGooglePending(true);
    await signIn("google", { callbackUrl });
  };

  const InputField = ({
    name,
    label,
    type = "text",
    placeholder,
    right,
  }: {
    name: keyof LoginFields;
    label: string;
    type?: string;
    placeholder?: string;
    right?: React.ReactNode;
  }) => (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={name}
        className="label"
        style={{ color: "var(--muted-light)", fontSize: "0.6rem" }}
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={name}
          type={type}
          value={fields[name]}
          onChange={(e) =>
            setFields((f) => ({ ...f, [name]: e.target.value }))
          }
          onBlur={validate}
          placeholder={placeholder}
          className="input-dark"
          style={{
            borderColor: errors[name]
              ? "rgba(239,68,68,0.5)"
              : undefined,
            paddingRight: right ? "44px" : undefined,
          }}
          autoComplete={name === "email" ? "email" : "current-password"}
          aria-invalid={!!errors[name]}
          aria-describedby={errors[name] ? `${name}-error` : undefined}
        />
        {right && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{right}</div>
        )}
      </div>
      {errors[name] && (
        <p
          id={`${name}-error`}
          role="alert"
          style={{ color: "#f87171", fontSize: "0.72rem" }}
        >
          {errors[name]}
        </p>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Global error */}
      {globalError && (
        <div
          className="flex items-start gap-2 p-3 mb-6 animate-fade-in"
          role="alert"
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)",
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#f87171"
            strokeWidth="2"
            className="mt-0.5 flex-shrink-0"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p style={{ color: "#f87171", fontSize: "0.8rem" }}>{globalError}</p>
        </div>
      )}

      <div className="flex flex-col gap-5">
        <InputField
          name="email"
          label="Alamat Email"
          type="email"
          placeholder="nama@email.com"
        />
        <InputField
          name="password"
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="Password Anda"
          right={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              style={{ color: "var(--muted)", lineHeight: 0 }}
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            >
              {showPassword ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          }
        />

        {/* Forgot password */}
        <div className="flex justify-end -mt-2">
          <Link
            href="/auth/forgot-password"
            className="label transition-colors hover:text-gold-400"
            style={{ color: "var(--muted)", fontSize: "0.6rem" }}
          >
            Lupa password?
          </Link>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          className="label py-3.5 w-full transition-all duration-200 flex items-center justify-center gap-2"
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
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ animation: "spin 0.8s linear infinite" }}
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          )}
          {isPending ? "Memproses..." : "Masuk"}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div
            className="flex-1 h-px"
            style={{ background: "rgba(196,162,74,0.08)" }}
          />
          <span className="label" style={{ color: "var(--muted)", fontSize: "0.58rem" }}>
            atau
          </span>
          <div
            className="flex-1 h-px"
            style={{ background: "rgba(196,162,74,0.08)" }}
          />
        </div>

        {/* Google OAuth */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={isGooglePending}
          className="flex items-center justify-center gap-3 w-full py-3 transition-all duration-200"
          style={{
            border: "1px solid rgba(196,162,74,0.15)",
            color: "var(--ivory-300)",
            background: "transparent",
            cursor: isGooglePending ? "not-allowed" : "pointer",
            opacity: isGooglePending ? 0.7 : 1,
          }}
        >
          {/* Google icon */}
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span className="label" style={{ fontSize: "0.65rem" }}>
            {isGooglePending ? "Menghubungkan..." : "Lanjutkan dengan Google"}
          </span>
        </button>
      </div>

      {/* Register link */}
      <p
        className="text-center mt-8"
        style={{ color: "var(--muted)", fontSize: "0.8rem" }}
      >
        Belum punya akun?{" "}
        <Link
          href="/auth/register"
          className="transition-colors hover:text-gold-400"
          style={{ color: "var(--gold-500)" }}
        >
          Daftar sekarang
        </Link>
      </p>
    </form>
  );
}
