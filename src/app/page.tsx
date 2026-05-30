// src/app/page.tsx
// Landing page — dark luxury editorial parfum store

import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { getFeaturedProducts } from "@/lib/actions/products";
import { ProductCard, ProductCardSkeleton } from "@/components/product/ProductCard";

// ─── Hero Section ─────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section
      className="relative min-h-screen flex items-end overflow-hidden"
      style={{ paddingBottom: "clamp(60px, 10vw, 120px)" }}
    >
      {/* Background — deep gradient with decorative elements */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 80% at 60% 40%, rgba(196,162,74,0.06) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 20% 80%, rgba(196,162,74,0.04) 0%, transparent 50%)",
          }}
        />
        {/* Decorative vertical lines */}
        <div
          className="absolute top-0 bottom-0 left-1/3"
          style={{ width: "1px", background: "linear-gradient(to bottom, transparent, rgba(196,162,74,0.08), transparent)" }}
        />
        <div
          className="absolute top-0 bottom-0 right-1/4"
          style={{ width: "1px", background: "linear-gradient(to bottom, transparent, rgba(196,162,74,0.05), transparent)" }}
        />
        {/* Floating orbs */}
        <div
          className="absolute rounded-full"
          style={{
            width: "clamp(300px, 50vw, 700px)",
            height: "clamp(300px, 50vw, 700px)",
            top: "-10%",
            right: "-5%",
            background: "radial-gradient(circle, rgba(196,162,74,0.04) 0%, transparent 70%)",
            animation: "float 8s ease-in-out infinite",
          }}
        />
      </div>

      {/* Content */}
      <div
        className="relative z-10 w-full"
        style={{ padding: "0 var(--container-px)" }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-end">
          {/* Left — main copy */}
          <div>
            {/* Pre-heading label */}
            <div className="flex items-center gap-4 mb-8 animate-fade-up">
              <div className="divider-gold w-12" />
              <span className="label" style={{ color: "var(--gold-500)" }}>
                Koleksi Musim Ini
              </span>
            </div>

            {/* Main heading */}
            <h1
              className="font-display font-light animate-fade-up delay-100"
              style={{
                lineHeight: 0.92,
                letterSpacing: "-0.02em",
                color: "var(--ivory-100)",
              }}
            >
              Seni{" "}
              <em
                className="italic"
                style={{ color: "var(--gold-400)" }}
              >
                Wewangian
              </em>
              <br />
              yang Abadi
            </h1>

            <p
              className="mt-8 leading-relaxed animate-fade-up delay-200"
              style={{
                color: "var(--muted-light)",
                maxWidth: "400px",
                fontSize: "0.95rem",
              }}
            >
              Setiap parfum adalah ingatan yang belum terjadi.
              Temukan koleksi eksklusif dari rumah-rumah wewangian
              terkemuka Prancis, Italia, dan Timur Tengah.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap items-center gap-4 mt-10 animate-fade-up delay-300">
              <Link
                href="/catalog"
                className="label px-8 py-4 transition-all duration-300 hover:opacity-90"
                style={{
                  background: "var(--gold-600)",
                  color: "var(--obsidian-950)",
                  fontSize: "0.65rem",
                  letterSpacing: "0.18em",
                }}
              >
                Jelajahi Koleksi
              </Link>
              <Link
                href="/catalog?category=niche"
                className="label px-8 py-4 transition-all duration-300"
                style={{
                  border: "1px solid rgba(196,162,74,0.25)",
                  color: "var(--gold-400)",
                  fontSize: "0.65rem",
                  letterSpacing: "0.18em",
                }}
              >
                Niche Perfume
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-10 mt-14 animate-fade-up delay-400">
              {[
                { value: "200+", label: "Koleksi" },
                { value: "50+", label: "Brand" },
                { value: "10K+", label: "Pelanggan" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p
                    className="font-display text-3xl"
                    style={{ color: "var(--ivory-100)", lineHeight: 1 }}
                  >
                    {stat.value}
                  </p>
                  <p className="label mt-1" style={{ color: "var(--muted)", fontSize: "0.58rem" }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — hero product visual */}
          <div
            className="hidden lg:flex items-end justify-end animate-fade-in delay-200"
          >
            <div className="relative">
              {/* Large decorative number */}
              <span
                className="font-display absolute -top-16 -left-8 select-none pointer-events-none"
                style={{
                  fontSize: "18rem",
                  color: "rgba(196,162,74,0.03)",
                  lineHeight: 1,
                  fontWeight: 700,
                }}
              >
                I
              </span>

              {/* Floating product card */}
              <div
                className="relative"
                style={{
                  width: "280px",
                  background: "var(--obsidian-800)",
                  border: "1px solid rgba(196,162,74,0.1)",
                  padding: "1px",
                  animation: "float 6s ease-in-out infinite",
                }}
              >
                <div
                  className="relative overflow-hidden"
                  style={{ height: "380px" }}
                >
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ background: "var(--obsidian-800)" }}
                  >
                    <div className="text-center">
                      <div
                        className="font-display text-6xl mb-4"
                        style={{ color: "rgba(196,162,74,0.15)" }}
                      >
                        ✦
                      </div>
                      <p className="label" style={{ color: "var(--muted)" }}>
                        Foto Produk
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <p className="label mb-1" style={{ color: "var(--muted)", fontSize: "0.58rem" }}>
                    Chanel
                  </p>
                  <p
                    className="font-display text-xl"
                    style={{ color: "var(--ivory-200)" }}
                  >
                    Bleu de Chanel
                  </p>
                  <p className="label mt-1" style={{ color: "var(--gold-500)" }}>
                    Rp 2.750.000
                  </p>
                </div>
              </div>

              {/* Badge floating */}
              <div
                className="absolute -right-6 top-8 label px-3 py-2"
                style={{
                  background: "var(--gold-600)",
                  color: "var(--obsidian-950)",
                  fontSize: "0.58rem",
                  transform: "rotate(2deg)",
                }}
              >
                Best Seller
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in delay-600"
      >
        <span className="label" style={{ color: "var(--muted)", fontSize: "0.55rem" }}>
          Scroll
        </span>
        <div
          className="w-px h-10"
          style={{
            background: "linear-gradient(to bottom, var(--gold-700), transparent)",
            animation: "float 2s ease-in-out infinite",
          }}
        />
      </div>
    </section>
  );
}

// ─── Marquee brand strip ──────────────────────────────────────────────────────
const BRANDS = [
  "Chanel", "Dior", "YSL", "Viktor & Rolf", "Byredo",
  "Le Labo", "Creed", "Maison Margiela", "Tom Ford", "Jo Malone",
  "Hermès", "Guerlain", "Amouage", "Xerjoff",
];

function BrandMarquee() {
  return (
    <section
      className="overflow-hidden py-6"
      style={{
        borderTop: "1px solid rgba(196,162,74,0.06)",
        borderBottom: "1px solid rgba(196,162,74,0.06)",
        background: "var(--obsidian-900)",
      }}
    >
      <div className="marquee-track flex gap-16 whitespace-nowrap">
        {[...BRANDS, ...BRANDS].map((brand, i) => (
          <span
            key={i}
            className="font-display text-2xl"
            style={{ color: "rgba(196,162,74,0.12)", letterSpacing: "0.05em" }}
          >
            {brand}
          </span>
        ))}
      </div>
    </section>
  );
}

// ─── Featured products ────────────────────────────────────────────────────────
async function FeaturedProducts() {
  const products = await getFeaturedProducts(4);

  if (products.length === 0) return null;

  return (
    <section style={{ padding: "var(--section-gap) var(--container-px)" }}>
      {/* Section header */}
      <div className="flex items-end justify-between mb-12">
        <div>
          <div className="flex items-center gap-4 mb-4">
            <div className="divider-gold w-8" />
            <span className="label" style={{ color: "var(--gold-500)" }}>
              Pilihan Kurator
            </span>
          </div>
          <h2 className="font-display font-light" style={{ color: "var(--ivory-100)" }}>
            Koleksi <em>Unggulan</em>
          </h2>
        </div>
        <Link
          href="/catalog"
          className="label hidden md:flex items-center gap-3 transition-colors hover:text-gold-400"
          style={{ color: "var(--muted-light)", fontSize: "0.62rem" }}
        >
          Lihat Semua
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map((product, i) => (
          <div
            key={product.id}
            className="animate-fade-up"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <ProductCard
              product={product}
              priority={i < 2}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

function FeaturedProductsSkeleton() {
  return (
    <section style={{ padding: "var(--section-gap) var(--container-px)" }}>
      <div className="flex items-end justify-between mb-12">
        <div className="flex flex-col gap-3">
          <div className="skeleton h-3 w-24" />
          <div className="skeleton h-10 w-64" />
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}

// ─── Brand story / Editorial section ─────────────────────────────────────────
function BrandStory() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        padding: "var(--section-gap) var(--container-px)",
        background: "var(--obsidian-900)",
        borderTop: "1px solid rgba(196,162,74,0.06)",
      }}
    >
      {/* Decorative background text */}
      <div
        className="absolute inset-0 flex items-center justify-center select-none pointer-events-none overflow-hidden"
      >
        <span
          className="font-display uppercase"
          style={{
            fontSize: "clamp(6rem, 20vw, 18rem)",
            color: "rgba(196,162,74,0.025)",
            letterSpacing: "-0.05em",
            lineHeight: 1,
            whiteSpace: "nowrap",
          }}
        >
          Parfum
        </span>
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left — story */}
        <div>
          <div className="flex items-center gap-4 mb-8">
            <div className="divider-gold w-8" />
            <span className="label" style={{ color: "var(--gold-500)" }}>
              Kisah Kami
            </span>
          </div>
          <h2 className="font-display font-light mb-8" style={{ color: "var(--ivory-100)" }}>
            Lebih dari{" "}
            <br />
            <em style={{ color: "var(--gold-400)" }}>Sekadar Wewangian</em>
          </h2>
          <p className="leading-relaxed mb-6" style={{ color: "var(--muted-light)", fontSize: "0.95rem" }}>
            Kami percaya bahwa parfum adalah bentuk seni paling intim. Setiap
            tetes mengandung kenangan, emosi, dan identitas yang tak terucapkan.
            Maison Parfum hadir untuk menjembatani Anda dengan rumah-rumah
            wewangian terbaik dunia.
          </p>
          <p className="leading-relaxed mb-10" style={{ color: "var(--muted)", fontSize: "0.95rem" }}>
            Dari ladang lavender di Provence hingga pasar rempah-rempah di Oman,
            setiap bahan baku dipilih dengan cermat oleh para parfumer berpengalaman
            yang mendedikasikan hidupnya pada seni penciptaan aroma.
          </p>

          {/* Feature list */}
          <div className="flex flex-col gap-4">
            {[
              "100% Produk Original Bergaransi",
              "Pengiriman Aman ke Seluruh Indonesia",
              "Konsultasi Parfum Personal Gratis",
              "Sampel Tersedia untuk Semua Produk",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div
                  className="w-4 h-4 flex items-center justify-center flex-shrink-0"
                  style={{ border: "1px solid var(--gold-600)" }}
                >
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="var(--gold-500)" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span style={{ color: "var(--muted-light)", fontSize: "0.85rem" }}>
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — editorial grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Large placeholder image */}
          <div
            className="col-span-2 relative overflow-hidden"
            style={{
              height: "280px",
              background: "var(--obsidian-800)",
              border: "1px solid rgba(196,162,74,0.08)",
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display text-4xl" style={{ color: "rgba(196,162,74,0.1)" }}>
                ✦
              </span>
            </div>
            <div
              className="absolute bottom-4 left-4 label"
              style={{ color: "var(--muted)", fontSize: "0.58rem" }}
            >
              Atelier · Paris
            </div>
          </div>
          {/* Two smaller */}
          {[
            { label: "Raw Materials" },
            { label: "Craftsmanship" },
          ].map((item) => (
            <div
              key={item.label}
              className="relative overflow-hidden"
              style={{
                height: "160px",
                background: "var(--obsidian-800)",
                border: "1px solid rgba(196,162,74,0.08)",
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display text-2xl" style={{ color: "rgba(196,162,74,0.08)" }}>
                  ✦
                </span>
              </div>
              <div
                className="absolute bottom-3 left-3 label"
                style={{ color: "var(--muted)", fontSize: "0.55rem" }}
              >
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Category grid ────────────────────────────────────────────────────────────
const CATEGORIES = [
  { slug: "floral", label: "Floral", desc: "Bunga & kelembutan", emoji: "🌸" },
  { slug: "woody", label: "Woody", desc: "Kayu & tanah", emoji: "🌲" },
  { slug: "oriental", label: "Oriental", desc: "Rempah & sensual", emoji: "🌙" },
  { slug: "fresh", label: "Fresh", desc: "Segar & bersih", emoji: "💧" },
  { slug: "citrus", label: "Citrus", desc: "Jeruk & vitalitas", emoji: "🍊" },
  { slug: "gourmand", label: "Gourmand", desc: "Manis & hangat", emoji: "🍫" },
];

function CategoryGrid() {
  return (
    <section style={{ padding: "var(--section-gap) var(--container-px)" }}>
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <div className="divider-gold w-8" />
          <span className="label" style={{ color: "var(--gold-500)" }}>
            Jelajahi
          </span>
        </div>
        <h2 className="font-display font-light" style={{ color: "var(--ivory-100)" }}>
          Temukan <em>Karakter</em>
          <br />
          Anda
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {CATEGORIES.map((cat, i) => (
          <Link
            key={cat.slug}
            href={`/catalog?category=${cat.slug}`}
            className="group block animate-fade-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div
              className="relative overflow-hidden p-6 flex flex-col items-center text-center transition-all duration-300"
              style={{
                background: "var(--obsidian-900)",
                border: "1px solid rgba(196,162,74,0.06)",
                height: "160px",
              }}
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: "radial-gradient(ellipse at center, rgba(196,162,74,0.06) 0%, transparent 70%)",
                }}
              />

              <span className="text-3xl mb-3 relative z-10">{cat.emoji}</span>
              <p
                className="font-display text-lg relative z-10"
                style={{ color: "var(--ivory-200)" }}
              >
                {cat.label}
              </p>
              <p
                className="label mt-1 relative z-10"
                style={{ color: "var(--muted)", fontSize: "0.58rem" }}
              >
                {cat.desc}
              </p>

              {/* Bottom accent */}
              <div
                className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: "var(--gold-600)" }}
              />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ─── Trust signals ────────────────────────────────────────────────────────────
const TRUST_ITEMS = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "100% Original",
    desc: "Semua produk bersertifikat asli dari distributor resmi",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="1" y="3" width="15" height="13" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
    title: "Pengiriman Cepat",
    desc: "Dikirim dalam 1–3 hari kerja ke seluruh Indonesia",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    title: "Konsultasi Gratis",
    desc: "Tim parfumer kami siap membantu Anda menemukan aroma yang tepat",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polyline points="20 12 20 22 4 22 4 12" />
        <rect x="2" y="7" width="20" height="5" />
        <line x1="12" y1="22" x2="12" y2="7" />
        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
      </svg>
    ),
    title: "Pengemasan Mewah",
    desc: "Setiap pesanan dikemas dengan kotak eksklusif siap kado",
  },
];

function TrustSection() {
  return (
    <section
      style={{
        padding: "var(--section-gap) var(--container-px)",
        background: "var(--obsidian-900)",
        borderTop: "1px solid rgba(196,162,74,0.06)",
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {TRUST_ITEMS.map((item, i) => (
          <div
            key={item.title}
            className="flex flex-col items-center text-center animate-fade-up"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div
              className="flex items-center justify-center w-12 h-12 mb-5"
              style={{
                border: "1px solid rgba(196,162,74,0.15)",
                color: "var(--gold-500)",
              }}
            >
              {item.icon}
            </div>
            <h4
              className="font-display text-lg mb-2"
              style={{ color: "var(--ivory-200)" }}
            >
              {item.title}
            </h4>
            <p style={{ color: "var(--muted)", fontSize: "0.82rem", lineHeight: 1.6 }}>
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <>
      <HeroSection />
      <BrandMarquee />
      <Suspense fallback={<FeaturedProductsSkeleton />}>
        <FeaturedProducts />
      </Suspense>
      <CategoryGrid />
      <BrandStory />
      <TrustSection />
    </>
  );
}
