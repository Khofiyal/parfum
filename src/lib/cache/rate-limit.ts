// src/lib/cache/rate-limit.ts
// Rate limiting helper untuk API routes sensitif

import { rateLimit } from "./redis";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface RateLimitConfig {
  max: number;
  windowSec: number;
}

const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  login: {
    max: parseInt(process.env["RATE_LIMIT_LOGIN_MAX"] ?? "5"),
    windowSec: parseInt(process.env["RATE_LIMIT_LOGIN_WINDOW"] ?? "900"),
  },
  register: {
    max: parseInt(process.env["RATE_LIMIT_REGISTER_MAX"] ?? "3"),
    windowSec: parseInt(process.env["RATE_LIMIT_REGISTER_WINDOW"] ?? "3600"),
  },
  checkout: {
    max: parseInt(process.env["RATE_LIMIT_CHECKOUT_MAX"] ?? "10"),
    windowSec: parseInt(process.env["RATE_LIMIT_CHECKOUT_WINDOW"] ?? "300"),
  },
  default: {
    max: 60,
    windowSec: 60,
  },
};

/**
 * Ambil IP dari request.
 */
function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

/**
 * Apply rate limiting ke request.
 * Return NextResponse 429 jika melebihi limit, null jika aman.
 */
export async function applyRateLimit(
  req: NextRequest,
  type: keyof typeof RATE_LIMIT_CONFIGS = "default",
  identifier?: string // Bisa berdasarkan user ID, bukan cuma IP
): Promise<NextResponse | null> {
  const config = RATE_LIMIT_CONFIGS[type] ?? RATE_LIMIT_CONFIGS["default"]!;
  const ip = getClientIp(req);
  const key = `rl:${type}:${identifier ?? ip}`;

  const result = await rateLimit(key, config.max, config.windowSec);

  if (!result.success) {
    return NextResponse.json(
      {
        error: "Terlalu banyak permintaan. Silakan coba lagi nanti.",
        retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": config.max.toString(),
          "X-RateLimit-Remaining": result.remaining.toString(),
          "X-RateLimit-Reset": result.resetAt.toString(),
          "Retry-After": Math.ceil((result.resetAt - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  return null;
}
