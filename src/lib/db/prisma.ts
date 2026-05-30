// src/lib/db/prisma.ts
// Singleton Prisma Client — mencegah koneksi berlebih di development (hot reload)

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env["NODE_ENV"] === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    datasources: {
      db: {
        url: process.env["DATABASE_URL"],
      },
    },
  });

if (process.env["NODE_ENV"] !== "production") {
  globalForPrisma.prisma = prisma;
}

// ─── Read-only client (untuk query produk, katalog) ──────────────────────────
const globalForPrismaRO = globalThis as unknown as {
  prismaRO: PrismaClient | undefined;
};

export const prismaRO =
  globalForPrismaRO.prismaRO ??
  new PrismaClient({
    log: process.env["NODE_ENV"] === "development" ? ["error"] : ["error"],
    datasources: {
      db: {
        url: process.env["DATABASE_READONLY_URL"] ?? process.env["DATABASE_URL"],
      },
    },
  });

if (process.env["NODE_ENV"] !== "production") {
  globalForPrismaRO.prismaRO = prismaRO;
}
