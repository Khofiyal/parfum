// src/lib/db/audit.ts
// Audit log helper — catat semua aksi penting

import { prisma } from "./prisma";
import type { NextRequest } from "next/server";

interface AuditLogParams {
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
  req?: NextRequest;
}

export async function createAuditLog({
  userId,
  action,
  entity,
  entityId,
  metadata,
  req,
}: AuditLogParams): Promise<void> {
  try {
    const ipAddress = req
      ? (req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        req.headers.get("x-real-ip") ??
        "unknown")
      : undefined;

    const userAgent = req ? req.headers.get("user-agent") ?? undefined : undefined;

    await prisma.auditLog.create({
      data: {
        userId: userId ?? undefined,
        action,
        entity,
        entityId: entityId ?? undefined,
        metadata: metadata ?? undefined,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    // Jangan throw error agar tidak menghentikan proses utama
    console.error("[AuditLog] Failed to create audit log:", error);
  }
}

// ─── Predefined actions ───────────────────────────────────────────────────────

export const AuditActions = {
  // User
  USER_REGISTER: "USER_REGISTER",
  USER_LOGIN: "USER_LOGIN",
  USER_LOGOUT: "USER_LOGOUT",
  USER_UPDATE_PROFILE: "USER_UPDATE_PROFILE",
  USER_SUSPEND: "USER_SUSPEND",
  USER_UNSUSPEND: "USER_UNSUSPEND",
  USER_CHANGE_PASSWORD: "USER_CHANGE_PASSWORD",

  // Order
  ORDER_CREATE: "ORDER_CREATE",
  ORDER_CANCEL: "ORDER_CANCEL",
  ORDER_STATUS_UPDATE: "ORDER_STATUS_UPDATE",
  ORDER_PAYMENT_SUCCESS: "ORDER_PAYMENT_SUCCESS",
  ORDER_PAYMENT_FAILED: "ORDER_PAYMENT_FAILED",

  // Product
  PRODUCT_CREATE: "PRODUCT_CREATE",
  PRODUCT_UPDATE: "PRODUCT_UPDATE",
  PRODUCT_DELETE: "PRODUCT_DELETE",
  PRODUCT_TOGGLE_ACTIVE: "PRODUCT_TOGGLE_ACTIVE",

  // Cart
  CART_ADD: "CART_ADD",
  CART_REMOVE: "CART_REMOVE",
  CART_CLEAR: "CART_CLEAR",

  // Admin
  ADMIN_LOGIN: "ADMIN_LOGIN",
  ADMIN_EXPORT_REPORT: "ADMIN_EXPORT_REPORT",
} as const;

export type AuditAction = (typeof AuditActions)[keyof typeof AuditActions];
