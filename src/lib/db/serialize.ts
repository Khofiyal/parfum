// src/lib/db/serialize.ts
// Utility untuk mengkonversi Prisma Decimal → number sebelum dikirim ke Client Components
// Next.js App Router TIDAK bisa serialize Prisma Decimal objects secara otomatis

import type { Decimal } from "@prisma/client/runtime/library";

// Tipe helper — field yang sudah di-serialize
type SerializedValue<T> =
  T extends Decimal ? number :
  T extends Date ? string :
  T extends object ? SerializedObject<T> :
  T extends Array<infer U> ? SerializedValue<U>[] :
  T;

type SerializedObject<T> = {
  [K in keyof T]: SerializedValue<T[K]>;
};

/**
 * Serialize satu object Prisma — konversi semua Decimal → number, Date → string ISO.
 * Gunakan ini sebelum mengirim data dari Server Component ke Client Component.
 */
export function serializeProduct<T extends Record<string, unknown>>(obj: T): SerializedObject<T> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      result[key] = value;
    } else if (
      typeof value === "object" &&
      "toNumber" in value &&
      typeof (value as Decimal).toNumber === "function"
    ) {
      // Prisma Decimal → number
      result[key] = (value as Decimal).toNumber();
    } else if (value instanceof Date) {
      // Date → ISO string (agar serializable)
      result[key] = value.toISOString();
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) =>
        item !== null && typeof item === "object" ? serializeProduct(item as Record<string, unknown>) : item
      );
    } else if (typeof value === "object") {
      result[key] = serializeProduct(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }

  return result as SerializedObject<T>;
}

/**
 * Serialize array of Prisma objects.
 */
export function serializeProducts<T extends Record<string, unknown>>(
  items: T[]
): SerializedObject<T>[] {
  return items.map(serializeProduct);
}
