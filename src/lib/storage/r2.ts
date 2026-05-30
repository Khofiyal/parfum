// src/lib/storage/r2.ts
// Cloudflare R2 storage — upload foto produk

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

// R2 menggunakan S3-compatible API
const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env["R2_ACCOUNT_ID"]}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env["R2_ACCESS_KEY_ID"]!,
    secretAccessKey: process.env["R2_SECRET_ACCESS_KEY"]!,
  },
});

const BUCKET = process.env["R2_BUCKET_NAME"]!;
const PUBLIC_URL = process.env["R2_PUBLIC_URL"]!;

// ─── Upload ───────────────────────────────────────────────────────────────────

interface UploadResult {
  key: string;
  url: string;
}

/**
 * Upload file ke R2 dan return public URL.
 * Key format: products/{productId}/{uuid}.{ext}
 */
export async function uploadProductImage(
  file: Buffer | Uint8Array,
  contentType: string,
  productId: string
): Promise<UploadResult> {
  const ext = contentType.split("/")[1] ?? "jpg";
  const key = `products/${productId}/${randomUUID()}.${ext}`;

  await r2Client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: file,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
      Metadata: {
        productId,
        uploadedAt: new Date().toISOString(),
      },
    })
  );

  return {
    key,
    url: `${PUBLIC_URL}/${key}`,
  };
}

/**
 * Generate presigned URL untuk upload langsung dari browser.
 * Expires dalam 5 menit.
 */
export async function getPresignedUploadUrl(
  productId: string,
  contentType: string
): Promise<{ uploadUrl: string; key: string; publicUrl: string }> {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
  if (!allowedTypes.includes(contentType)) {
    throw new Error("Tipe file tidak diizinkan");
  }

  const ext = contentType.split("/")[1] ?? "jpg";
  const key = `products/${productId}/${randomUUID()}.${ext}`;

  const uploadUrl = await getSignedUrl(
    r2Client,
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: contentType,
      // Batasi ukuran max 5MB
      ContentLength: 5 * 1024 * 1024,
    }),
    { expiresIn: 300 } // 5 menit
  );

  return {
    uploadUrl,
    key,
    publicUrl: `${PUBLIC_URL}/${key}`,
  };
}

/**
 * Hapus file dari R2.
 */
export async function deleteFile(key: string): Promise<void> {
  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  );
}

/**
 * Generate presigned URL untuk download (file private).
 */
export async function getPresignedDownloadUrl(
  key: string,
  expiresIn = 3600
): Promise<string> {
  return getSignedUrl(
    r2Client,
    new GetObjectCommand({ Bucket: BUCKET, Key: key }),
    { expiresIn }
  );
}
