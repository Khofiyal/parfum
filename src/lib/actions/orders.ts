// src/lib/actions/orders.ts
// Server Actions untuk order — validasi stok server-side, idempotency, Midtrans

"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { checkoutSchema } from "@/lib/validations/checkout";
import { createSnapToken } from "@/lib/payment/midtrans";
import { createAuditLog, AuditActions } from "@/lib/db/audit";
import { invalidateCache } from "@/lib/cache/redis";
import type { ActionResult } from "@/types";
import { randomUUID } from "crypto";

// ─── Create Order ─────────────────────────────────────────────────────────────
interface CreateOrderResult {
  orderId: string;
  snapToken: string;
  snapRedirectUrl: string;
}

export async function createOrder(
  input: { addressId: string; notes?: string }
): Promise<ActionResult<CreateOrderResult>> {
  const session = await auth();
  if (!session) return { success: false, error: "Silakan login terlebih dahulu" };

  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Input tidak valid", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { addressId, notes } = parsed.data;

  // ─── 1. Ambil cart items ─────────────────────────────────────────────────
  const cartItems = await prisma.cart.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        select: {
          id: true, name: true, price: true, stock: true,
          imageUrls: true, isActive: true,
        },
      },
    },
  });

  if (cartItems.length === 0) {
    return { success: false, error: "Keranjang belanja kosong" };
  }

  // ─── 2. Validasi stok server-side (JANGAN percaya client) ────────────────
  for (const item of cartItems) {
    if (!item.product.isActive) {
      return { success: false, error: `Produk "${item.product.name}" sudah tidak tersedia` };
    }
    if (item.product.stock < item.quantity) {
      return {
        success: false,
        error: `Stok "${item.product.name}" tidak mencukupi (tersedia: ${item.product.stock})`,
      };
    }
  }

  // ─── 3. Validasi alamat ──────────────────────────────────────────────────
  const address = await prisma.address.findFirst({
    where: { id: addressId, userId: session.user.id },
  });
  if (!address) return { success: false, error: "Alamat tidak valid" };

  // ─── 4. Ambil data user ──────────────────────────────────────────────────
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true },
  });
  if (!user) return { success: false, error: "User tidak ditemukan" };

  // ─── 5. Hitung total — gunakan harga dari DB (bukan dari client) ─────────
  // price sudah number karena getCart() sudah serialize
  const subtotal = cartItems.reduce((sum, item) => {
    return sum + (item.product.price as number) * item.quantity;
  }, 0);

  const SHIPPING_COST = subtotal >= 500_000 ? 0 : 25_000;
  const totalAmount = subtotal + SHIPPING_COST;

  // ─── 6. Buat order dalam transaction ─────────────────────────────────────
  const idempotencyKey = randomUUID();

  const order = await prisma.$transaction(async (tx) => {
    // Re-check stok dalam transaction (cegah race condition)
    for (const item of cartItems) {
      const product = await tx.product.findUnique({
        where: { id: item.product.id },
        select: { stock: true },
      });
      if (!product || product.stock < item.quantity) {
        throw new Error(`Stok "${item.product.name}" habis saat checkout`);
      }
    }

    // Kurangi stok
    for (const item of cartItems) {
      await tx.product.update({
        where: { id: item.product.id },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // Buat order
    const newOrder = await tx.order.create({
      data: {
        userId: session.user.id,
        addressId,
        status: "PENDING",
        totalAmount,
        shippingCost: SHIPPING_COST,
        paymentStatus: "UNPAID",
        idempotencyKey,
        notes: notes ?? undefined,
        orderItems: {
          create: cartItems.map((item) => {
            const price = item.product.price as number; // sudah number dari getCart()
            const images = item.product.imageUrls as string[];
            return {
              productId: item.product.id,
              quantity: item.quantity,
              priceAtPurchase: price,
              productName: item.product.name,
              productImage: images[0] ?? undefined,
            };
          }),
        },
      },
    });

    // Hapus cart setelah order dibuat
    await tx.cart.deleteMany({ where: { userId: session.user.id } });

    return newOrder;
  });

  // ─── 7. Buat Midtrans Snap token ─────────────────────────────────────────
  let snapToken: string;
  let snapRedirectUrl: string;

  try {
    const snap = await createSnapToken({
      orderId: order.id,
      grossAmount: totalAmount,
      idempotencyKey,
      items: [
        ...cartItems.map((item) => ({
          id: item.product.id,
          price: item.product.price as number,
          quantity: item.quantity,
          name: item.product.name,
        })),
        ...(SHIPPING_COST > 0
          ? [{ id: "SHIPPING", price: SHIPPING_COST, quantity: 1, name: "Ongkos Kirim" }]
          : []),
      ],
      customer: {
        first_name: user.name ?? "Pelanggan",
        email: user.email,
        phone: address.phone,
      },
      shipping: {
        first_name: address.recipientName,
        address: address.fullAddress,
        city: address.city,
        postal_code: address.postalCode,
        phone: address.phone,
        country_code: "IDN",
      },
    });

    snapToken = snap.token;
    snapRedirectUrl = snap.redirect_url;

    // Simpan token ke order
    await prisma.order.update({
      where: { id: order.id },
      data: { snapToken, snapRedirectUrl },
    });
  } catch (err) {
    // Kalau Midtrans gagal, rollback stok
    await prisma.$transaction(async (tx) => {
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.product.id },
          data: { stock: { increment: item.quantity } },
        });
      }
      await tx.order.delete({ where: { id: order.id } });
    });
    console.error("[Order] Midtrans error:", err);
    return { success: false, error: "Gagal membuat sesi pembayaran. Silakan coba lagi." };
  }

  // ─── 8. Audit log ────────────────────────────────────────────────────────
  await createAuditLog({
    userId: session.user.id,
    action: AuditActions.ORDER_CREATE,
    entity: "Order",
    entityId: order.id,
    metadata: { totalAmount, itemCount: cartItems.length },
  });

  // Invalidate cache produk (stok berubah)
  await invalidateCache("products:*").catch(() => {});

  return {
    success: true,
    data: { orderId: order.id, snapToken, snapRedirectUrl },
  };
}

// ─── Cancel Order ─────────────────────────────────────────────────────────────
export async function cancelOrder(orderId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: session.user.id },
    include: { orderItems: true },
  });

  if (!order) return { success: false, error: "Order tidak ditemukan" };
  if (!["PENDING", "PROCESSING"].includes(order.status)) {
    return { success: false, error: "Order tidak dapat dibatalkan" };
  }

  await prisma.$transaction(async (tx) => {
    // Kembalikan stok
    for (const item of order.orderItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }

    await tx.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
    });
  });

  await createAuditLog({
    userId: session.user.id,
    action: AuditActions.ORDER_CANCEL,
    entity: "Order",
    entityId: orderId,
  });

  await invalidateCache("products:*").catch(() => {});
  return { success: true };
}

// ─── Get order detail ─────────────────────────────────────────────────────────
export async function getOrderDetail(orderId: string) {
  const session = await auth();
  if (!session) return null;

  return prisma.order.findFirst({
    where: {
      id: orderId,
      // Admin bisa lihat semua, user hanya milik sendiri
      ...(session.user.role !== "ADMIN" && { userId: session.user.id }),
    },
    include: {
      orderItems: {
        include: {
          product: { select: { id: true, name: true, slug: true, imageUrls: true } },
        },
      },
      address: true,
      user: { select: { name: true, email: true } },
    },
  });
}
