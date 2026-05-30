// src/app/auth/error/page.tsx
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Autentikasi Gagal" };

const ERROR_MESSAGES: Record<string, { title: string; desc: string }> = {
  OAuthAccountNotLinked: {
    title: "Email Sudah Terdaftar",
    desc: "Email ini sudah terdaftar dengan metode login berbeda. Gunakan metode login yang sama saat pertama kali mendaftar.",
  },
  OAuthSignin: {
    title: "Gagal Masuk dengan Google",
    desc: "Terjadi kesalahan saat menghubungkan ke Google. Silakan coba lagi.",
  },
  AccessDenied: {
    title: "Akses Ditolak",
    desc: "Akun Anda telah dinonaktifkan. Hubungi tim support kami untuk bantuan.",
  },
  Default: {
    title: "Autentikasi Gagal",
    desc: "Terjadi kesalahan yang tidak terduga. Silakan coba lagi atau hubungi support jika masalah berlanjut.",
  },
};

interface Props {
  searchParams: Promise<{ error?: string }>;
}

export default async function AuthErrorPage({ searchParams }: Props) {
  const { error } = await searchParams;
  const errorInfo = ERROR_MESSAGES[error ?? ""] ?? ERROR_MESSAGES["Default"]!;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-8"
      style={{ background: "var(--obsidian-950)" }}
    >
      <div className="max-w-sm w-full text-center">
        <div
          className="font-display text-8xl mb-6 mx-auto flex items-center justify-center"
          style={{ color: "rgba(239,68,68,0.15)" }}
        >
          ✕
        </div>
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="divider-gold w-8" />
          <span className="label" style={{ color: "#f87171", fontSize: "0.6rem" }}>
            Error
          </span>
          <div className="divider-gold w-8" />
        </div>
        <h1
          className="font-display font-light text-3xl mb-4"
          style={{ color: "var(--ivory-100)" }}
        >
          {errorInfo.title}
        </h1>
        <p
          className="leading-relaxed mb-10"
          style={{ color: "var(--muted-light)", fontSize: "0.875rem" }}
        >
          {errorInfo.desc}
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/auth/login"
            className="label py-3 block transition-all duration-200"
            style={{
              background: "var(--gold-600)",
              color: "var(--obsidian-950)",
              fontSize: "0.65rem",
              letterSpacing: "0.18em",
            }}
          >
            Kembali ke Halaman Login
          </Link>
          <Link
            href="/"
            className="label py-3 block transition-all duration-200"
            style={{
              border: "1px solid rgba(196,162,74,0.15)",
              color: "var(--muted-light)",
              fontSize: "0.65rem",
            }}
          >
            Ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
