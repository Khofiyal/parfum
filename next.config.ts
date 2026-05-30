import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
      },
      {
        protocol: "https",
        hostname: "*.cloudflare.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },

  experimental: {
    serverActions: {
      allowedOrigins: [process.env["NEXT_PUBLIC_APP_URL"] ?? "localhost:3000"],
      bodySizeLimit: "10mb",
    },
  },

  // Security headers diatur di Nginx, tapi tambahkan juga di Next.js sebagai fallback
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

// Sentry config — hanya aktif kalau SENTRY_DSN diset
export default process.env["SENTRY_DSN"]
  ? withSentryConfig(nextConfig, {
      org: process.env["SENTRY_ORG"],
      project: process.env["SENTRY_PROJECT"],
      silent: !process.env["CI"],
      widenClientFileUpload: true,
      tunnelRoute: "/monitoring",
      hideSourceMaps: true,
      disableLogger: true,
    })
  : nextConfig;
