// src/app/layout.tsx
// Root layout — metadata, fonts, providers

import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SessionProvider } from "@/components/layout/SessionProvider";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: {
    template: "%s | Maison Parfum",
    default: "Maison Parfum — Koleksi Wewangian Eksklusif",
  },
  description:
    "Temukan koleksi parfum premium dari rumah-rumah wewangian terkemuka dunia. Setiap botol adalah sebuah kisah.",
  keywords: ["parfum", "wewangian", "fragrance", "perfume", "niche perfume", "Indonesia"],
  authors: [{ name: "Maison Parfum" }],
  creator: "Maison Parfum",
  metadataBase: new URL(process.env["NEXT_PUBLIC_APP_URL"] ?? "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Maison Parfum",
    title: "Maison Parfum — Koleksi Wewangian Eksklusif",
    description:
      "Temukan koleksi parfum premium dari rumah-rumah wewangian terkemuka dunia.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Maison Parfum",
    description: "Koleksi wewangian eksklusif.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0907",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        {/* Preconnect ke Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <SessionProvider session={session}>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
