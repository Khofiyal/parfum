// src/lib/actions/addresses.ts
"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { addressSchema } from "@/lib/validations/checkout";
import type { ActionResult } from "@/types";

// ─── Get user addresses ───────────────────────────────────────────────────────
export async function getAddresses() {
  const session = await auth();
  if (!session) return [];

  return prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
}

// ─── Create address ───────────────────────────────────────────────────────────
export async function createAddress(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  const parsed = addressSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Input tidak valid", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { isDefault, ...data } = parsed.data;

  // Jika ini alamat default, unset default yang lain
  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId: session.user.id },
      data: { isDefault: false },
    });
  }

  // Jika belum ada alamat, otomatis jadi default
  const count = await prisma.address.count({ where: { userId: session.user.id } });

  const address = await prisma.address.create({
    data: {
      ...data,
      userId: session.user.id,
      isDefault: isDefault || count === 0,
    },
  });

  revalidatePath("/profile/addresses");
  revalidatePath("/checkout");
  return { success: true, data: { id: address.id } };
}

// ─── Update address ───────────────────────────────────────────────────────────
export async function updateAddress(
  id: string,
  input: unknown
): Promise<ActionResult> {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  const parsed = addressSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Input tidak valid", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  // Pastikan alamat milik user ini
  const existing = await prisma.address.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) return { success: false, error: "Alamat tidak ditemukan" };

  if (parsed.data.isDefault) {
    await prisma.address.updateMany({
      where: { userId: session.user.id },
      data: { isDefault: false },
    });
  }

  await prisma.address.update({ where: { id }, data: parsed.data });

  revalidatePath("/profile/addresses");
  revalidatePath("/checkout");
  return { success: true };
}

// ─── Delete address ───────────────────────────────────────────────────────────
export async function deleteAddress(id: string): Promise<ActionResult> {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  const existing = await prisma.address.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) return { success: false, error: "Alamat tidak ditemukan" };

  await prisma.address.delete({ where: { id } });

  // Kalau yang dihapus adalah default, set yang terbaru jadi default
  if (existing.isDefault) {
    const next = await prisma.address.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });
    if (next) {
      await prisma.address.update({ where: { id: next.id }, data: { isDefault: true } });
    }
  }

  revalidatePath("/profile/addresses");
  revalidatePath("/checkout");
  return { success: true };
}

// ─── Set default address ──────────────────────────────────────────────────────
export async function setDefaultAddress(id: string): Promise<ActionResult> {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  const existing = await prisma.address.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) return { success: false, error: "Alamat tidak ditemukan" };

  await prisma.$transaction([
    prisma.address.updateMany({
      where: { userId: session.user.id },
      data: { isDefault: false },
    }),
    prisma.address.update({ where: { id }, data: { isDefault: true } }),
  ]);

  revalidatePath("/profile/addresses");
  revalidatePath("/checkout");
  return { success: true };
}
