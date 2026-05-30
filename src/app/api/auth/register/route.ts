// src/app/api/auth/register/route.ts
// Register endpoint dengan rate limiting & validasi Zod

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { registerSchema } from "@/lib/validations/auth";
import { applyRateLimit } from "@/lib/cache/rate-limit";
import { createAuditLog, AuditActions } from "@/lib/db/audit";

export async function POST(req: NextRequest) {
  // Rate limiting — 3 register per jam per IP
  const rateLimitResponse = await applyRateLimit(req, "register");
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await req.json() as unknown;

    // Validasi input
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Input tidak valid",
          fieldErrors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    // Cek email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 409 }
      );
    }

    // Hash password (cost factor 12 = ~250ms, cukup lambat untuk brute force)
    const passwordHash = await bcrypt.hash(password, 12);

    // Buat user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "USER",
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    // Audit log
    await createAuditLog({
      userId: user.id,
      action: AuditActions.USER_REGISTER,
      entity: "User",
      entityId: user.id,
      metadata: { method: "credentials" },
      req,
    });

    return NextResponse.json(
      { success: true, message: "Registrasi berhasil" },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Register] Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
