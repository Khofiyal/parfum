// src/app/api/upload/presign/route.ts
// Generate presigned URL untuk upload foto produk langsung ke R2

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { getPresignedUploadUrl } from "@/lib/storage/r2";
import { z } from "zod";

const schema = z.object({
  productId: z.string().min(1),
  contentType: z.enum(["image/jpeg", "image/png", "image/webp", "image/avif"]),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json() as unknown;
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Input tidak valid" }, { status: 400 });
    }

    const { uploadUrl, key, publicUrl } = await getPresignedUploadUrl(
      parsed.data.productId,
      parsed.data.contentType
    );

    return NextResponse.json({ uploadUrl, key, publicUrl });
  } catch (error) {
    console.error("[Upload] Error:", error);
    return NextResponse.json({ error: "Gagal membuat upload URL" }, { status: 500 });
  }
}
