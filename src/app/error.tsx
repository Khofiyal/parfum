// src/app/error.tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    // Report ke Sentry di production
    if (process.env.NODE_ENV === "production") {
      console.error("[GlobalError]", error);
    }
  }, [error]);

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "var(--obsidian-950)" }}
    >
      <div
        className="absolute inset-0 flex items-center justify-center select-none pointer-events-none"
      >
        <span
          className="font-display"
          style={{
            fontSize: "clamp(10rem, 35vw, 28rem)",
            color: "rgba(239,68,68,0.02)",
            lineHeight: 1,
            fontWeight: 700,
          }}
        >
          500
        </span>
      </div>

      <div className="relative z-10 text-center px-8 max-w-lg">
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="divider-gold w-8" />
          <span className="label" style={{ color: "#f87171", fontSize: "0.6rem" }}>
            Kesalahan Server
          </span>
          <div className="divider-gold w-8" />
        </div>

        <h1
          className="font-display font-light mb-6"
          style={{ color: "var(--ivory-100)", fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
        >
          Sesuatu berjalan
          <br />
          <em style={{ color: "var(--gold-400)" }}>tidak semestinya</em>
        </h1>

        <p
          className="leading-relaxed mb-10"
          style={{ color: "var(--muted-light)", fontSize: "0.9rem" }}
        >
          Terjadi kesalahan yang tidak terduga. Tim kami telah diberitahu.
          Coba muat ulang halaman atau kembali nanti.
        </p>

        {error.digest && (
          <p
            className="label mb-8"
            style={{ color: "var(--muted)", fontSize: "0.58rem" }}
          >
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={reset}
            className="label px-8 py-3 w-full sm:w-auto transition-all"
            style={{
              background: "var(--gold-600)",
              color: "var(--obsidian-950)",
              fontSize: "0.65rem",
              letterSpacing: "0.18em",
              cursor: "pointer",
              border: "none",
            }}
          >
            Coba Lagi
          </button>
          <Link
            href="/"
            className="label px-8 py-3 w-full sm:w-auto transition-all"
            style={{
              border: "1px solid rgba(196,162,74,0.2)",
              color: "var(--gold-400)",
              fontSize: "0.65rem",
              letterSpacing: "0.18em",
            }}
          >
            Ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
