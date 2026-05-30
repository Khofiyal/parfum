// src/app/checkout/page.tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getCart } from "@/lib/actions/cart";
import { getAddresses } from "@/lib/actions/addresses";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const session = await auth();
  if (!session) redirect("/auth/login?callbackUrl=/checkout");

  const [cartItems, addresses] = await Promise.all([getCart(), getAddresses()]);

  if (cartItems.length === 0) redirect("/cart");

  return (
    <div style={{ paddingTop: "72px", minHeight: "100vh", background: "var(--obsidian-950)" }}>
      <div style={{ padding: "48px var(--container-px)" }}>
        {/* Header */}
        <div className="mb-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-5">
            {[
              { href: "/cart", label: "Keranjang" },
              { href: "/checkout", label: "Checkout" },
              { href: "#", label: "Pembayaran" },
            ].map((step, i, arr) => (
              <div key={step.label} className="flex items-center gap-2">
                <Link
                  href={step.href}
                  className="label transition-colors"
                  style={{
                    color: i === 1 ? "var(--gold-500)" : "var(--muted)",
                    fontSize: "0.6rem",
                    pointerEvents: i === 1 ? "none" : "auto",
                  }}
                >
                  {step.label}
                </Link>
                {i < arr.length - 1 && (
                  <span style={{ color: "var(--muted)", fontSize: "0.6rem" }}>/</span>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="divider-gold w-8" />
            <span className="label" style={{ color: "var(--gold-500)" }}>
              Langkah 2 dari 3
            </span>
          </div>
          <h1 className="font-display font-light" style={{ color: "var(--ivory-100)" }}>
            Konfirmasi Pesanan
          </h1>
        </div>

        <CheckoutForm addresses={addresses} cartItems={cartItems} />
      </div>
    </div>
  );
}
