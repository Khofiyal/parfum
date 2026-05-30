// src/lib/payment/midtrans.ts
// Integrasi Midtrans Snap — payment gateway Indonesia

import crypto from "crypto";

const SERVER_KEY = process.env["MIDTRANS_SERVER_KEY"]!;
const IS_PRODUCTION = process.env["MIDTRANS_ENV"] === "production";

const BASE_URL = IS_PRODUCTION
  ? "https://app.midtrans.com"
  : "https://app.sandbox.midtrans.com";

const SNAP_URL = IS_PRODUCTION
  ? "https://app.midtrans.com/snap/v1"
  : "https://app.sandbox.midtrans.com/snap/v1";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MidtransItem {
  id: string;
  price: number;
  quantity: number;
  name: string;
}

interface MidtransCustomer {
  first_name: string;
  email: string;
  phone?: string;
}

interface MidtransShipping {
  first_name: string;
  address: string;
  city: string;
  postal_code: string;
  phone?: string;
  country_code?: string;
}

interface CreateTransactionParams {
  orderId: string;
  grossAmount: number;
  items: MidtransItem[];
  customer: MidtransCustomer;
  shipping?: MidtransShipping;
  idempotencyKey: string;
}

interface SnapTokenResponse {
  token: string;
  redirect_url: string;
}

interface MidtransWebhookPayload {
  transaction_time: string;
  transaction_status: string;
  transaction_id: string;
  status_message: string;
  status_code: string;
  signature_key: string;
  settlement_time?: string;
  payment_type: string;
  order_id: string;
  merchant_id: string;
  gross_amount: string;
  fraud_status?: string;
  currency: string;
}

// ─── Core functions ───────────────────────────────────────────────────────────

/**
 * Buat Snap token untuk payment.
 * Midtrans Snap akan handle semua metode pembayaran.
 */
export async function createSnapToken(
  params: CreateTransactionParams
): Promise<SnapTokenResponse> {
  const authToken = Buffer.from(`${SERVER_KEY}:`).toString("base64");

  const body = {
    transaction_details: {
      order_id: params.orderId,
      gross_amount: Math.round(params.grossAmount),
    },
    item_details: params.items.map((item) => ({
      id: item.id,
      price: Math.round(item.price),
      quantity: item.quantity,
      name: item.name.substring(0, 50), // max 50 char
    })),
    customer_details: params.customer,
    shipping_address: params.shipping,
    callbacks: {
      finish: `${process.env["NEXT_PUBLIC_APP_URL"]}/orders`,
    },
    expiry: {
      unit: "hour",
      duration: 2, // 2 jam untuk menyelesaikan payment
    },
  };

  const response = await fetch(`${SNAP_URL}/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${authToken}`,
      // Idempotency key mencegah transaksi duplikat
      "Idempotency-Key": params.idempotencyKey,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Midtrans error: ${JSON.stringify(error)}`);
  }

  return response.json() as Promise<SnapTokenResponse>;
}

/**
 * Verifikasi HMAC signature dari webhook Midtrans.
 * WAJIB dilakukan sebelum memproses webhook.
 *
 * Signature = SHA512(order_id + status_code + gross_amount + server_key)
 */
export function verifyWebhookSignature(payload: MidtransWebhookPayload): boolean {
  const signatureString =
    payload.order_id +
    payload.status_code +
    payload.gross_amount +
    SERVER_KEY;

  const expectedSignature = crypto
    .createHash("sha512")
    .update(signatureString)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(payload.signature_key, "hex"),
    Buffer.from(expectedSignature, "hex")
  );
}

/**
 * Tentukan status order berdasarkan status transaksi Midtrans.
 */
export function parseTransactionStatus(payload: MidtransWebhookPayload): {
  paymentStatus: "PAID" | "PENDING" | "FAILED" | "EXPIRED";
  shouldProcessOrder: boolean;
} {
  const { transaction_status, fraud_status } = payload;

  if (
    transaction_status === "capture" &&
    (fraud_status === "accept" || fraud_status === undefined)
  ) {
    return { paymentStatus: "PAID", shouldProcessOrder: true };
  }

  if (transaction_status === "settlement") {
    return { paymentStatus: "PAID", shouldProcessOrder: true };
  }

  if (transaction_status === "pending") {
    return { paymentStatus: "PENDING", shouldProcessOrder: false };
  }

  if (
    transaction_status === "deny" ||
    transaction_status === "cancel" ||
    transaction_status === "failure" ||
    fraud_status === "deny"
  ) {
    return { paymentStatus: "FAILED", shouldProcessOrder: false };
  }

  if (transaction_status === "expire") {
    return { paymentStatus: "EXPIRED", shouldProcessOrder: false };
  }

  return { paymentStatus: "PENDING", shouldProcessOrder: false };
}

/**
 * Cek status transaksi langsung ke Midtrans API.
 * Digunakan sebagai fallback jika webhook tidak diterima.
 */
export async function getTransactionStatus(orderId: string): Promise<MidtransWebhookPayload> {
  const authToken = Buffer.from(`${SERVER_KEY}:`).toString("base64");

  const response = await fetch(
    `${BASE_URL}/v2/${orderId}/status`,
    {
      headers: {
        Authorization: `Basic ${authToken}`,
      },
      // Jangan cache ini
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to get transaction status for order: ${orderId}`);
  }

  return response.json() as Promise<MidtransWebhookPayload>;
}

export type { MidtransWebhookPayload, MidtransItem, MidtransCustomer };
