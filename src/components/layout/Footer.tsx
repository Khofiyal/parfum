// src/components/layout/Footer.tsx

import Link from "next/link";

const FOOTER_LINKS = {
  Koleksi: [
    { href: "/catalog?category=floral", label: "Floral" },
    { href: "/catalog?category=woody", label: "Woody" },
    { href: "/catalog?category=oriental", label: "Oriental" },
    { href: "/catalog?category=fresh", label: "Fresh" },
    { href: "/catalog", label: "Semua Produk" },
  ],
  Informasi: [
    { href: "/about", label: "Tentang Kami" },
    { href: "/shipping", label: "Pengiriman" },
    { href: "/returns", label: "Pengembalian" },
    { href: "/authenticity", label: "Keaslian Produk" },
  ],
  Bantuan: [
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Kontak" },
    { href: "/track-order", label: "Lacak Pesanan" },
  ],
};

const BRANDS = [
  "Chanel", "Dior", "YSL", "Viktor & Rolf",
  "Maison Margiela", "Byredo", "Le Labo", "Creed",
];

export function Footer() {
  return (
    <footer
      style={{
        background: "var(--obsidian-900)",
        borderTop: "1px solid rgba(196, 162, 74, 0.08)",
      }}
    >
      {/* Marquee brand strip */}
      <div
        className="overflow-hidden py-4"
        style={{ borderBottom: "1px solid rgba(196, 162, 74, 0.06)" }}
      >
        <div className="marquee-track flex gap-12 whitespace-nowrap">
          {[...BRANDS, ...BRANDS].map((brand, i) => (
            <span key={i} className="label" style={{ color: "var(--obsidian-500)" }}>
              {brand}
            </span>
          ))}
        </div>
      </div>

      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-12 py-16"
        style={{ padding: "64px var(--container-px)" }}
      >
        {/* Brand column */}
        <div className="col-span-2 md:col-span-1">
          <div className="flex flex-col leading-none mb-6">
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
          <p className="text-sm leading-relaxed" style={{ color: "var(--muted)", maxWidth: "200px" }}>
            Menghadirkan wewangian terbaik dunia ke tangan Anda sejak 2020.
          </p>
          {/* Social links */}
          <div className="flex gap-4 mt-6">
            {["Instagram", "TikTok", "WhatsApp"].map((s) => (
              <a
                key={s}
                href="#"
                className="label transition-colors hover:text-gold-400"
                style={{ color: "var(--muted)", fontSize: "0.6rem" }}
              >
                {s}
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(FOOTER_LINKS).map(([title, links]) => (
          <div key={title}>
            <p className="label mb-5" style={{ color: "var(--gold-600)" }}>
              {title}
            </p>
            <ul className="flex flex-col gap-3">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors hover:text-ivory-200"
                    style={{ color: "var(--muted)", fontSize: "0.82rem" }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div
        className="flex flex-col md:flex-row items-center justify-between gap-3 py-5"
        style={{
          padding: "20px var(--container-px)",
          borderTop: "1px solid rgba(196, 162, 74, 0.06)",
        }}
      >
        <p style={{ color: "var(--muted)", fontSize: "0.72rem" }}>
          © {new Date().getFullYear()} Maison Parfum. Hak cipta dilindungi.
        </p>
        <div className="flex gap-6">
          {["Kebijakan Privasi", "Syarat & Ketentuan"].map((t) => (
            <Link
              key={t}
              href="#"
              style={{ color: "var(--muted)", fontSize: "0.72rem" }}
              className="hover:text-ivory-300 transition-colors"
            >
              {t}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
