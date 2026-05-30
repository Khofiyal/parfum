// src/app/not-found.tsx
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "404 — Halaman Tidak Ditemukan" };

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "var(--obsidian-950)" }}
    >
      {/* Decorative background */}
      <div
        className="absolute inset-0 flex items-center justify-center select-none pointer-events-none"
      >
        <span
          className="font-display"
          style={{
            fontSize: "clamp(12rem, 40vw, 30rem)",
            color: "rgba(196,162,74,0.025)",
            lineHeight: 1,
            fontWeight: 700,
          }}
        >
          404
        </span>
      </div>

      <div className="relative z-10 text-center px-8 max-w-lg">
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="divider-gold w-8" />
          <span className="label" style={{ color: "var(--gold-500)" }}>
            Halaman Tidak Ditemukan
          </span>
          <div className="divider-gold w-8" />
        </div>

        <h1
          className="font-display font-light mb-6"
          style={{ color: "var(--ivory-100)", fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
        >
          Sepertinya halaman
          <br />
          <em style={{ color: "var(--gold-400)" }}>ini telah menguap</em>
        </h1>

        <p
          className="leading-relaxed mb-10"
          style={{ color: "var(--muted-light)", fontSize: "0.9rem" }}
        >
          Halaman yang Anda cari tidak ada atau telah dipindahkan.
          Mungkin Anda bisa menemukan apa yang Anda cari di katalog kami.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="label px-8 py-3 w-full sm:w-auto transition-all"
            style={{
              background: "var(--gold-600)",
              color: "var(--obsidian-950)",
              fontSize: "0.65rem",
              letterSpacing: "0.18em",
            }}
          >
            Ke Beranda
          </Link>
          <Link
            href="/catalog"
            className="label px-8 py-3 w-full sm:w-auto transition-all"
            style={{
              border: "1px solid rgba(196,162,74,0.2)",
              color: "var(--gold-400)",
              fontSize: "0.65rem",
              letterSpacing: "0.18em",
            }}
          >
            Lihat Katalog
          </Link>
        </div>
      </div>
    </div>
  );
}
