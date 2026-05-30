// src/app/profile/addresses/page.tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getAddresses } from "@/lib/actions/addresses";
import { AddressListClient } from "@/components/checkout/AddressListClient";

export const metadata: Metadata = { title: "Alamat Pengiriman" };

export default async function AddressesPage() {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const addresses = await getAddresses();

  return (
    <div style={{ paddingTop: "72px", minHeight: "100vh", background: "var(--obsidian-950)" }}>
      <div style={{ padding: "48px var(--container-px)", maxWidth: "720px" }}>
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="divider-gold w-8" />
            <span className="label" style={{ color: "var(--gold-500)" }}>Profil</span>
          </div>
          <h1 className="font-display font-light" style={{ color: "var(--ivory-100)" }}>
            Alamat Pengiriman
          </h1>
        </div>
        <AddressListClient initialAddresses={addresses} />
      </div>
    </div>
  );
}
