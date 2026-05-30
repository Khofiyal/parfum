// src/middleware.ts
// Proteksi route — dijalankan di Edge Runtime (Middleware)

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

// Route yang hanya bisa diakses user yang sudah login
const PROTECTED_USER_ROUTES = [
  "/profile",
  "/orders",
  "/checkout",
  "/cart/checkout",
];

// Route yang hanya bisa diakses ADMIN
const PROTECTED_ADMIN_ROUTES = ["/admin"];

// Route yang hanya bisa diakses user yang BELUM login (redirect ke home kalau sudah login)
const AUTH_ROUTES = [
  "/auth/login",
  "/auth/register",
];

export default auth(async (req: NextRequest & { auth: { user?: { id: string; role: string } } | null }) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const isLoggedIn = !!session?.user;
  const isAdmin = session?.user?.role === "ADMIN";

  // ─── Block user yang di-suspend ─────────────────────────────────────────
  // Ditangani di signIn callback auth.config.ts

  // ─── Auth routes (login, register) ──────────────────────────────────────
  if (AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // ─── Admin routes ────────────────────────────────────────────────────────
  if (PROTECTED_ADMIN_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // ─── Protected user routes ───────────────────────────────────────────────
  if (PROTECTED_USER_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // ─── Security headers tambahan di middleware ──────────────────────────────
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");

  return response;
});

export const config = {
  matcher: [
    /*
     * Match semua path kecuali:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - File publik (png, jpg, dll)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
