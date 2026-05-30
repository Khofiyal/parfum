// src/app/auth/login/page.tsx
// Halaman login — email/password + Google OAuth

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Masuk",
  description: "Masuk ke akun Maison Parfum Anda",
};

interface Props {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const session = await auth();
  if (session) redirect("/");

  const { callbackUrl, error } = await searchParams;

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "var(--obsidian-950)" }}
    >
      {/* Left panel — editorial visual */}
      <div
        className="hidden lg:flex flex-col justify-between w-1/2 relative overflow-hidden p-16"
        style={{ background: "var(--obsidian-900)" }}
      >
        {/* Background decoration */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 70% at 30% 60%, rgba(196,162,74,0.05) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-px"
          style={{
            background:
              "linear-gradient(to bottom, transparent, rgba(196,162,74,0.1), transparent)",
          }}
        />

        {/* Large decorative text */}
        <div
          className="absolute bottom-0 left-0 right-0 select-none pointer-events-none overflow-hidden"
          style={{ lineHeight: 0.85 }}
        >
          <span
            className="font-display block"
            style={{
              fontSize: "clamp(6rem, 14vw, 12rem)",
              color: "rgba(196,162,74,0.03)",
              letterSpacing: "-0.03em",
              transform: "translateY(20%)",
            }}
          >
            Bienvenue
          </span>
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex flex-col leading-none">
            <span
              className="font-display text-3xl tracking-[0.15em] uppercase"
              style={{ color: "var(--ivory-100)" }}
            >
              Maison
            </span>
            <span
              className="label"
              style={{ letterSpacing: "0.35em", fontSize: "0.55rem" }}
            >
              Parfum
            </span>
          </div>
        </div>

        {/* Quote */}
        <div className="relative z-10 max-w-xs">
          <div className="divider-gold w-8 mb-6" />
          <blockquote
            className="font-display text-2xl font-light italic leading-snug mb-4"
            style={{ color: "var(--ivory-200)" }}
          >
            "Parfum adalah kenangan yang belum sempat dilupakan."
          </blockquote>
          <p className="label" style={{ color: "var(--muted)", fontSize: "0.6rem" }}>
            — Coco Chanel
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col leading-none mb-12">
            <span
              className="font-display text-2xl tracking-[0.15em] uppercase"
              style={{ color: "var(--ivory-100)" }}
            >
              Maison
            </span>
            <span
              className="label"
              style={{ letterSpacing: "0.35em", fontSize: "0.55rem" }}
            >
              Parfum
            </span>
          </div>

          {/* Heading */}
          <div className="mb-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="divider-gold w-6" />
              <span className="label" style={{ color: "var(--gold-500)" }}>
                Selamat Datang
              </span>
            </div>
            <h1
              className="font-display font-light"
              style={{ fontSize: "clamp(2rem, 5vw, 3rem)", color: "var(--ivory-100)" }}
            >
              Masuk
            </h1>
          </div>

          <LoginForm callbackUrl={callbackUrl} serverError={error} />
        </div>
      </div>
    </div>
  );
}
