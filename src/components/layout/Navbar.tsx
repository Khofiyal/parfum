// src/components/layout/Navbar.tsx
// Navigation bar — dark luxury, minimal, sticky dengan scroll effect

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";

const NAV_LINKS = [
  { href: "/catalog", label: "Katalog" },
  { href: "/catalog?category=floral", label: "Floral" },
  { href: "/catalog?category=woody", label: "Woody" },
  { href: "/catalog?category=oriental", label: "Oriental" },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "?");

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: isScrolled
            ? "rgba(10, 9, 7, 0.92)"
            : "transparent",
          backdropFilter: isScrolled ? "blur(20px)" : "none",
          borderBottom: isScrolled
            ? "1px solid rgba(196, 162, 74, 0.08)"
            : "none",
        }}
      >
        <div
          className="flex items-center justify-between"
          style={{ padding: "0 var(--container-px)", height: "72px" }}
        >
          {/* Logo */}
          <Link href="/" className="flex flex-col leading-none group">
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
          </Link>

          {/* Center nav — desktop */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="label transition-colors duration-200 hover:text-gold-400"
                style={{
                  color: isActive(link.href)
                    ? "var(--gold-500)"
                    : "var(--muted-light)",
                  letterSpacing: "0.15em",
                  fontSize: "0.65rem",
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-4">
            {/* Search icon */}
            <Link
              href="/catalog"
              className="p-2 transition-colors duration-200"
              style={{ color: "var(--muted-light)" }}
              aria-label="Cari produk"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </Link>

            {/* Cart icon */}
            <Link
              href="/cart"
              className="p-2 relative transition-colors duration-200"
              style={{ color: "var(--muted-light)" }}
              aria-label="Keranjang belanja"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {/* Cart count badge — diisi via client component */}
              <span
                className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-xs font-medium rounded-full"
                style={{
                  background: "var(--gold-600)",
                  color: "var(--obsidian-950)",
                  fontSize: "0.6rem",
                  display: "none", // akan di-toggle via CartBadge component
                }}
                id="cart-badge"
              >
                0
              </span>
            </Link>

            {/* User menu */}
            {session ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserOpen(!isUserOpen)}
                  className="flex items-center gap-2 p-2 transition-colors duration-200"
                  style={{ color: "var(--muted-light)" }}
                  aria-label="Menu pengguna"
                >
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name ?? "User"}
                      className="w-7 h-7 rounded-full object-cover"
                      style={{ border: "1px solid var(--obsidian-600)" }}
                    />
                  ) : (
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center font-display text-sm"
                      style={{
                        background: "var(--obsidian-700)",
                        border: "1px solid var(--obsidian-600)",
                        color: "var(--gold-400)",
                      }}
                    >
                      {session.user.name?.charAt(0).toUpperCase() ?? "U"}
                    </div>
                  )}
                </button>

                {/* Dropdown */}
                {isUserOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-48 py-1"
                    style={{
                      background: "var(--obsidian-800)",
                      border: "1px solid rgba(196, 162, 74, 0.12)",
                    }}
                  >
                    <div
                      className="px-4 py-3 border-b"
                      style={{ borderColor: "rgba(196, 162, 74, 0.08)" }}
                    >
                      <p className="text-sm font-medium" style={{ color: "var(--ivory-200)" }}>
                        {session.user.name}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                        {session.user.email}
                      </p>
                    </div>
                    <Link
                      href="/profile"
                      className="block px-4 py-2.5 text-sm transition-colors hover:bg-obsidian-700"
                      style={{ color: "var(--muted-light)", fontSize: "0.8rem" }}
                      onClick={() => setIsUserOpen(false)}
                    >
                      Profil Saya
                    </Link>
                    <Link
                      href="/orders"
                      className="block px-4 py-2.5 text-sm transition-colors hover:bg-obsidian-700"
                      style={{ color: "var(--muted-light)", fontSize: "0.8rem" }}
                      onClick={() => setIsUserOpen(false)}
                    >
                      Riwayat Pesanan
                    </Link>
                    {session.user.role === "ADMIN" && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2.5 text-sm transition-colors hover:bg-obsidian-700"
                        style={{ color: "var(--gold-500)", fontSize: "0.8rem" }}
                        onClick={() => setIsUserOpen(false)}
                      >
                        Admin Panel
                      </Link>
                    )}
                    <div
                      className="border-t mt-1 pt-1"
                      style={{ borderColor: "rgba(196, 162, 74, 0.08)" }}
                    >
                      <button
                        onClick={() => {
                          setIsUserOpen(false);
                          void signOut({ callbackUrl: "/" });
                        }}
                        className="block w-full text-left px-4 py-2.5 transition-colors hover:bg-obsidian-700"
                        style={{ color: "var(--muted)", fontSize: "0.8rem" }}
                      >
                        Keluar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="hidden md:block label px-4 py-2 transition-all duration-200"
                style={{
                  border: "1px solid rgba(196, 162, 74, 0.25)",
                  color: "var(--gold-400)",
                  fontSize: "0.6rem",
                  letterSpacing: "0.2em",
                }}
              >
                Masuk
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2"
              style={{ color: "var(--muted-light)" }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <div className="flex flex-col gap-1.5 w-5">
                <span
                  className="h-px block transition-all duration-300"
                  style={{
                    background: "var(--ivory-300)",
                    transform: isMenuOpen ? "rotate(45deg) translateY(4px)" : "none",
                  }}
                />
                <span
                  className="h-px block transition-all duration-300"
                  style={{
                    background: "var(--ivory-300)",
                    opacity: isMenuOpen ? 0 : 1,
                  }}
                />
                <span
                  className="h-px block transition-all duration-300"
                  style={{
                    background: "var(--ivory-300)",
                    transform: isMenuOpen ? "rotate(-45deg) translateY(-4px)" : "none",
                  }}
                />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div
        className="fixed inset-0 z-40 md:hidden transition-all duration-500"
        style={{
          background: "rgba(10, 9, 7, 0.97)",
          opacity: isMenuOpen ? 1 : 0,
          pointerEvents: isMenuOpen ? "auto" : "none",
          paddingTop: "80px",
        }}
      >
        <nav className="flex flex-col gap-1 p-8">
          {NAV_LINKS.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-display text-4xl py-3 border-b transition-colors"
              style={{
                borderColor: "rgba(196, 162, 74, 0.08)",
                color: isActive(link.href) ? "var(--gold-400)" : "var(--ivory-300)",
                animationDelay: `${i * 60}ms`,
              }}
              onClick={() => setIsMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {!session && (
            <Link
              href="/auth/login"
              className="mt-8 label text-center py-4"
              style={{
                border: "1px solid rgba(196, 162, 74, 0.25)",
                color: "var(--gold-400)",
              }}
              onClick={() => setIsMenuOpen(false)}
            >
              Masuk
            </Link>
          )}
        </nav>
      </div>
    </>
  );
}
