// src/lib/actions/admin.ts
// Server Actions khusus admin

"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { productSchema } from "@/lib/validations/product";
import { createAuditLog, AuditActions } from "@/lib/db/audit";
import { invalidateCache } from "@/lib/cache/redis";
import type { ActionResult } from "@/types";

// Guard helper
async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

// ─── Order management ─────────────────────────────────────────────────────────

export async function updateOrderStatus(
  orderId: string,
  status: string
): Promise<ActionResult> {
  const session = await requireAdmin();

  const VALID = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];
  if (!VALID.includes(status)) return { success: false, error: "Status tidak valid" };

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { status: true },
  });
  if (!order) return { success: false, error: "Order tidak ditemukan" };

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: status as never,
      ...(status === "DELIVERED" && { deliveredAt: new Date() }),
      ...(status === "SHIPPED"   && { shippedAt: new Date() }),
    },
  });

  await createAuditLog({
    userId: session.user.id,
    action: AuditActions.ORDER_STATUS_UPDATE,
    entity: "Order",
    entityId: orderId,
    metadata: { from: order.status, to: status },
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath(`/orders/${orderId}`);
  return { success: true };
}

export async function updateOrderTracking(
  orderId: string,
  data: { trackingNumber: string; shippingCourier: string }
): Promise<ActionResult> {
  const session = await requireAdmin();

  if (!data.trackingNumber.trim() || !data.shippingCourier.trim()) {
    return { success: false, error: "No. resi dan kurir wajib diisi" };
  }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      trackingNumber: data.trackingNumber.trim(),
      shippingCourier: data.shippingCourier.trim(),
      status: "SHIPPED",
      shippedAt: new Date(),
    },
  });

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath(`/orders/${orderId}`);
  return { success: true };
}

// ─── Product management ───────────────────────────────────────────────────────

export async function createProduct(input: unknown): Promise<ActionResult<{ id: string }>> {
  const session = await requireAdmin();

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Input tidak valid", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  // Cek slug unik
  const existing = await prisma.product.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) return { success: false, error: "Slug sudah digunakan" };

  const product = await prisma.product.create({ data: parsed.data });

  await createAuditLog({
    userId: session.user.id,
    action: AuditActions.PRODUCT_CREATE,
    entity: "Product",
    entityId: product.id,
    metadata: { name: product.name },
  });

  await invalidateCache("products:*").catch(() => {});
  revalidatePath("/admin/products");
  revalidatePath("/catalog");
  return { success: true, data: { id: product.id } };
}

export async function updateProduct(
  id: string,
  input: unknown
): Promise<ActionResult> {
  const session = await requireAdmin();

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Input tidak valid", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  // Cek slug unik (kecuali milik sendiri)
  const slugConflict = await prisma.product.findFirst({
    where: { slug: parsed.data.slug, id: { not: id } },
  });
  if (slugConflict) return { success: false, error: "Slug sudah digunakan produk lain" };

  await prisma.product.update({ where: { id }, data: parsed.data });

  await createAuditLog({
    userId: session.user.id,
    action: AuditActions.PRODUCT_UPDATE,
    entity: "Product",
    entityId: id,
  });

  await invalidateCache(`product:slug:*`).catch(() => {});
  await invalidateCache("products:*").catch(() => {});
  revalidatePath("/admin/products");
  revalidatePath("/catalog");
  return { success: true };
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const session = await requireAdmin();

  // Soft delete — set isActive = false, jangan hapus karena ada di order history
  await prisma.product.update({ where: { id }, data: { isActive: false } });

  await createAuditLog({
    userId: session.user.id,
    action: AuditActions.PRODUCT_DELETE,
    entity: "Product",
    entityId: id,
  });

  await invalidateCache("products:*").catch(() => {});
  revalidatePath("/admin/products");
  revalidatePath("/catalog");
  return { success: true };
}

export async function updateProductStock(
  id: string,
  stock: number
): Promise<ActionResult> {
  await requireAdmin();

  if (stock < 0 || stock > 99_999) return { success: false, error: "Stok tidak valid" };

  await prisma.product.update({ where: { id }, data: { stock } });

  await invalidateCache("products:*").catch(() => {});
  revalidatePath("/admin/products");
  return { success: true };
}

// ─── User management ──────────────────────────────────────────────────────────

export async function suspendUser(userId: string): Promise<ActionResult> {
  const session = await requireAdmin();
  if (userId === session.user.id) return { success: false, error: "Tidak bisa suspend diri sendiri" };

  await prisma.user.update({ where: { id: userId }, data: { isSuspended: true } });

  await createAuditLog({
    userId: session.user.id,
    action: AuditActions.USER_SUSPEND,
    entity: "User",
    entityId: userId,
  });

  revalidatePath("/admin/users");
  return { success: true };
}

export async function unsuspendUser(userId: string): Promise<ActionResult> {
  const session = await requireAdmin();

  await prisma.user.update({ where: { id: userId }, data: { isSuspended: false } });

  await createAuditLog({
    userId: session.user.id,
    action: AuditActions.USER_UNSUSPEND,
    entity: "User",
    entityId: userId,
  });

  revalidatePath("/admin/users");
  return { success: true };
}

// ─── Dashboard stats (reusable) ───────────────────────────────────────────────

export async function getSalesReport(
  from: Date,
  to: Date
): Promise<ActionResult<{
  revenue: number;
  orderCount: number;
  avgOrderValue: number;
  topProducts: Array<{ name: string; brand: string; revenue: number; quantity: number }>;
}>> {
  await requireAdmin();

  const [revenue, orders, topProducts] = await Promise.all([
    prisma.order.aggregate({
      where: { paymentStatus: "PAID", createdAt: { gte: from, lte: to } },
      _sum: { totalAmount: true },
      _count: true,
    }),
    prisma.order.count({
      where: { createdAt: { gte: from, lte: to } },
    }),
    prisma.orderItem.groupBy({
      by: ["productId"],
      where: { order: { paymentStatus: "PAID", createdAt: { gte: from, lte: to } } },
      _sum: { priceAtPurchase: true, quantity: true },
      orderBy: { _sum: { priceAtPurchase: "desc" } },
      take: 10,
    }),
  ]);

  // Ambil nama produk
  const productIds = topProducts.map((p) => p.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, brand: true },
  });

  const productMap = new Map(products.map((p) => [p.id, p]));
  const totalRevenue = revenue._sum.totalAmount?.toNumber() ?? 0;

  return {
    success: true,
    data: {
      revenue: totalRevenue,
      orderCount: orders,
      avgOrderValue: orders > 0 ? totalRevenue / orders : 0,
      topProducts: topProducts.map((tp) => {
        const product = productMap.get(tp.productId);
        return {
          name: product?.name ?? "Unknown",
          brand: product?.brand ?? "",
          revenue: tp._sum.priceAtPurchase?.toNumber() ?? 0,
          quantity: tp._sum.quantity ?? 0,
        };
      }),
    },
  };
}
