// src/lib/cache/redis.ts
// Redis client — digunakan untuk session, rate limiting, cache

import Redis from "ioredis";

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

function createRedisClient(): Redis {
  const client = new Redis({
    host: "127.0.0.1",
    port: 6379,
    password: process.env["REDIS_PASSWORD"],
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    // Connection pool
    enableOfflineQueue: true,
    connectTimeout: 10_000,
    // Health check
    enableReadyCheck: true,
  });

  client.on("error", (err) => {
    console.error("[Redis] Connection error:", err);
  });

  client.on("connect", () => {
    console.log("[Redis] Connected");
  });

  return client;
}

export const redis = globalForRedis.redis ?? createRedisClient();

if (process.env["NODE_ENV"] !== "production") {
  globalForRedis.redis = redis;
}

// ─── Rate Limiter ─────────────────────────────────────────────────────────────

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Sliding window rate limiter menggunakan Redis.
 *
 * @param key   - Unique key (e.g. "rl:login:192.168.1.1")
 * @param limit - Max requests per window
 * @param windowSec - Window size in seconds
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSec: number
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowMs = windowSec * 1000;

  // Gunakan sorted set untuk sliding window
  const pipe = redis.pipeline();
  pipe.zremrangebyscore(key, 0, now - windowMs);  // hapus entry expired
  pipe.zadd(key, now, `${now}-${Math.random()}`); // tambah entry baru
  pipe.zcard(key);                                 // hitung total
  pipe.expire(key, windowSec);                     // set TTL

  const results = await pipe.exec();
  const count = (results?.[2]?.[1] as number) ?? 0;
  const resetAt = now + windowMs;

  return {
    success: count <= limit,
    remaining: Math.max(0, limit - count),
    resetAt,
  };
}

// ─── Cache Helper ─────────────────────────────────────────────────────────────

/**
 * Get-or-set cache pattern.
 */
export async function cachedGet<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSec = 300
): Promise<T> {
  const cached = await redis.get(key);
  if (cached !== null) {
    return JSON.parse(cached) as T;
  }

  const data = await fetcher();
  await redis.setex(key, ttlSec, JSON.stringify(data));
  return data;
}

/**
 * Invalidate cache keys by pattern.
 */
export async function invalidateCache(pattern: string): Promise<void> {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}
