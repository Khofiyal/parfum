// src/lib/actions/cart.ts
// Server Actions untuk keranjang belanja

"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { cartItemSchema } from "@/lib/validations/checkout";
import { createAuditLog, AuditActions } from "@/lib/db/audit";
import type { ActionResult } from "@/types";

// ─── Add to cart ──────────────────────────────────────────────────────────────
export async function addToCart(input: {
  productId: string;
  quantity: number;
}): Promise<ActionResult> {
  const session = await auth();
  if (!session) return { success: false, error: "Silakan login terlebih dahulu" };

  const parsed = cartItemSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Input tidak valid" };
  }

  const { productId, quantity } = parsed.data;

  // Cek produk exist dan stok cukup
  const product = await prisma.product.findUnique({
    where: { id: productId, isActive: true },
    select: { id: true, name: true, stock: true },
  });

  if (!product) return { success: false, error: "Produk tidak ditemukan" };
  if (product.stock < quantity) {
    return { success: false, error: `Stok tidak cukup (tersedia: ${product.stock})` };
  }

  // Upsert — kalau sudah ada di cart, tambah quantity
  const existingCart = await prisma.cart.findUnique({
    where: { userId_productId: { userId: session.user.id, productId } },
  });

  const newQuantity = Math.min(
    (existingCart?.quantity ?? 0) + quantity,
    10
  );

  await prisma.cart.upsert({
    where: { userId_productId: { userId: session.user.id, productId } },
    create: { userId: session.user.id, productId, quantity },
    update: { quantity: newQuantity },
  });

  await createAuditLog({
    userId: session.user.id,
    action: AuditActions.CART_ADD,
    entity: "Cart",
    entityId: productId,
    metadata: { productName: product.name, quantity },
  });

  revalidatePath("/cart");
  return { success: true };
}

// ─── Update quantity ──────────────────────────────────────────────────────────
export async function updateCartQuantity(
  productId: string,
  quantity: number
): Promise<ActionResult> {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  if (quantity < 1 || quantity > 10) {
    return { success: false, error: "Jumlah tidak valid" };
  }

  // Verify stock
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { stock: true },
  });

  if (!product || product.stock < quantity) {
    return { success: false, error: "Stok tidak mencukupi" };
  }

  await prisma.cart.update({
    where: { userId_productId: { userId: session.user.id, productId } },
    data: { quantity },
  });

  revalidatePath("/cart");
  return { success: true };
}

// ─── Remove from cart ─────────────────────────────────────────────────────────
export async function removeFromCart(productId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  await prisma.cart.delete({
    where: { userId_productId: { userId: session.user.id, productId } },
  });

  await createAuditLog({
    userId: session.user.id,
    action: AuditActions.CART_REMOVE,
    entity: "Cart",
    entityId: productId,
  });

  revalidatePath("/cart");
  return { success: true };
}

// ─── Get cart ─────────────────────────────────────────────────────────────────
export async function getCart() {
  const session = await auth();
  if (!session) return [];

  const items = await prisma.cart.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          brand: true,
          price: true,
          stock: true,
          imageUrls: true,
          size: true,
          concentration: true,
          isActive: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  // Serialize Decimal price → number agar bisa dikirim ke Client Components
  return items.map((item) => ({
    ...item,
    product: {
      ...item.product,
      price: typeof item.product.price === "object" && "toNumber" in item.product.price
        ? (item.product.price as { toNumber: () => number }).toNumber()
        : Number(item.product.price),
    },
  }));
}

// ─── Clear cart ───────────────────────────────────────────────────────────────
export async function clearCart(): Promise<ActionResult> {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  await prisma.cart.deleteMany({ where: { userId: session.user.id } });

  revalidatePath("/cart");
  return { success: true };
}
