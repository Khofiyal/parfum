// src/app/auth/register/page.tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = { title: "Daftar Akun" };

export default async function RegisterPage() {
  const session = await auth();
  if (session) redirect("/");

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "var(--obsidian-950)" }}
    >
      {/* Left panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-1/2 relative overflow-hidden p-16"
        style={{ background: "var(--obsidian-900)" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 70% at 70% 40%, rgba(196,162,74,0.05) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-px"
          style={{
            background:
              "linear-gradient(to bottom, transparent, rgba(196,162,74,0.1), transparent)",
          }}
        />
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
            Nouveau
          </span>
        </div>

        <div className="relative z-10">
          <div className="flex flex-col leading-none">
            <span
              className="font-display text-3xl tracking-[0.15em] uppercase"
              style={{ color: "var(--ivory-100)" }}
            >
              Maison
            </span>
            <span className="label" style={{ letterSpacing: "0.35em", fontSize: "0.55rem" }}>
              Parfum
            </span>
          </div>
        </div>

        <div className="relative z-10 max-w-xs">
          <div className="divider-gold w-8 mb-6" />
          <h2
            className="font-display font-light text-3xl mb-4"
            style={{ color: "var(--ivory-200)" }}
          >
            Bergabunglah dengan
            <br />
            <em style={{ color: "var(--gold-400)" }}>komunitas kami</em>
          </h2>
          <div className="flex flex-col gap-3 mt-6">
            {[
              "Akses koleksi eksklusif",
              "Notifikasi produk baru",
              "Riwayat pesanan tersimpan",
              "Program loyalitas poin",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div
                  className="w-4 h-4 flex items-center justify-center flex-shrink-0"
                  style={{ border: "1px solid var(--gold-600)" }}
                >
                  <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="var(--gold-500)" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span style={{ color: "var(--muted-light)", fontSize: "0.82rem" }}>
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16 overflow-y-auto">
        <div className="w-full max-w-sm py-8">
          <div className="lg:hidden flex flex-col leading-none mb-10">
            <span
              className="font-display text-2xl tracking-[0.15em] uppercase"
              style={{ color: "var(--ivory-100)" }}
            >
              Maison
            </span>
            <span className="label" style={{ letterSpacing: "0.35em", fontSize: "0.55rem" }}>
              Parfum
            </span>
          </div>

          <div className="mb-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="divider-gold w-6" />
              <span className="label" style={{ color: "var(--gold-500)" }}>
                Buat Akun
              </span>
            </div>
            <h1
              className="font-display font-light"
              style={{ fontSize: "clamp(2rem, 5vw, 3rem)", color: "var(--ivory-100)" }}
            >
              Daftar
            </h1>
          </div>

          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
