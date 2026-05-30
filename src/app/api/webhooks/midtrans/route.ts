// src/app/api/webhooks/midtrans/route.ts
// Webhook handler Midtrans — verifikasi HMAC signature, update order status

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import {
  verifyWebhookSignature,
  parseTransactionStatus,
  type MidtransWebhookPayload,
} from "@/lib/payment/midtrans";
import { createAuditLog, AuditActions } from "@/lib/db/audit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let payload: MidtransWebhookPayload;
  try {
    payload = (await req.json()) as MidtransWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // 1. Verifikasi HMAC — WAJIB
  const isValid = verifyWebhookSignature(payload);
  if (!isValid) {
    console.error("[Webhook] Invalid signature for order:", payload.order_id);
    return NextResponse.json({ received: true, valid: false }, { status: 200 });
  }

  const { order_id, transaction_id } = payload;

  // 2. Cari order
  const order = await prisma.order.findFirst({
    where: { OR: [{ id: order_id }, { paymentId: order_id }] },
    select: { id: true, userId: true, paymentStatus: true, status: true },
  });
  if (!order) return NextResponse.json({ received: true }, { status: 200 });

  // 3. Idempotency
  if (order.paymentStatus === "PAID") {
    return NextResponse.json({ received: true, skipped: "already_paid" }, { status: 200 });
  }

  // 4. Parse status
  const { paymentStatus, shouldProcessOrder } = parseTransactionStatus(payload);

  // 5. Update dalam transaction
  try {
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          paymentId: transaction_id ?? order_id,
          paymentStatus: paymentStatus as never,
          paymentMethod: payload.payment_type,
          paidAt: paymentStatus === "PAID"
            ? new Date(payload.settlement_time ?? payload.transaction_time)
            : undefined,
          status: shouldProcessOrder ? "PROCESSING" : undefined,
        },
      });

      if (shouldProcessOrder) {
        await tx.auditLog.create({
          data: {
            userId: order.userId,
            action: AuditActions.ORDER_PAYMENT_SUCCESS,
            entity: "Order",
            entityId: order.id,
            metadata: { transactionId: transaction_id, paymentMethod: payload.payment_type },
          },
        });
      } else if (paymentStatus === "FAILED" || paymentStatus === "EXPIRED") {
        await tx.auditLog.create({
          data: {
            userId: order.userId,
            action: AuditActions.ORDER_PAYMENT_FAILED,
            entity: "Order",
            entityId: order.id,
            metadata: { status: paymentStatus },
          },
        });
        // Kembalikan stok
        const orderFull = await tx.order.findUnique({
          where: { id: order.id },
          include: { orderItems: { select: { productId: true, quantity: true } } },
        });
        if (orderFull) {
          for (const item of orderFull.orderItems) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            });
          }
          await tx.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } });
        }
      }
    });
  } catch (error) {
    console.error("[Webhook] DB error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
