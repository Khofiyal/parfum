// src/lib/validations/checkout.ts
// Zod schemas untuk checkout dan order

import { z } from "zod";

export const checkoutSchema = z.object({
  addressId: z.string().cuid("Alamat tidak valid"),
  notes: z.string().max(500, "Catatan maksimal 500 karakter").optional(),
});

export const addressSchema = z.object({
  label: z.string().min(1, "Label wajib diisi").max(50),
  recipientName: z.string().min(2, "Nama penerima minimal 2 karakter").max(100),
  phone: z
    .string()
    .regex(/^(\+62|62|0)8[1-9][0-9]{6,10}$/, "Nomor telepon tidak valid"),
  fullAddress: z.string().min(10, "Alamat terlalu pendek").max(500),
  city: z.string().min(2, "Kota wajib diisi").max(100),
  province: z.string().min(2, "Provinsi wajib diisi").max(100),
  postalCode: z.string().regex(/^\d{5}$/, "Kode pos harus 5 digit angka"),
  isDefault: z.boolean().default(false),
});

export const cartItemSchema = z.object({
  productId: z.string().cuid("Produk tidak valid"),
  quantity: z.number().int().min(1, "Quantity minimal 1").max(10, "Maksimal 10 per produk"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type CartItemInput = z.infer<typeof cartItemSchema>;
