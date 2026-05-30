// src/app/profile/page.tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = { title: "Profil Saya" };

export default async function ProfilePage() {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      createdAt: true,
      _count: { select: { orders: true, reviews: true } },
      addresses: {
        orderBy: { isDefault: "desc" },
        take: 5,
      },
    },
  });

  if (!user) redirect("/auth/login");

  const joinedDate = new Intl.DateTimeFormat("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(user.createdAt);

  return (
    <div
      style={{ paddingTop: "72px", minHeight: "100vh", background: "var(--obsidian-950)" }}
    >
      <div style={{ padding: "48px var(--container-px)", maxWidth: "900px" }}>
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="divider-gold w-8" />
            <span className="label" style={{ color: "var(--gold-500)" }}>Profil</span>
          </div>
          <h1 className="font-display font-light" style={{ color: "var(--ivory-100)" }}>
            Akun Saya
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left — avatar & info */}
          <div className="md:col-span-1">
            <div
              className="p-6 flex flex-col items-center text-center gap-4"
              style={{
                background: "var(--obsidian-900)",
                border: "1px solid rgba(196,162,74,0.08)",
              }}
            >
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name ?? "User"}
                  className="w-20 h-20 rounded-full object-cover"
                  style={{ border: "2px solid rgba(196,162,74,0.2)" }}
                />
              ) : (
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center font-display text-4xl"
                  style={{
                    background: "var(--obsidian-700)",
                    border: "2px solid rgba(196,162,74,0.15)",
                    color: "var(--gold-400)",
                  }}
                >
                  {user.name?.charAt(0).toUpperCase() ?? "U"}
                </div>
              )}

              <div>
                <p className="font-display text-xl" style={{ color: "var(--ivory-200)" }}>
                  {user.name}
                </p>
                <p style={{ color: "var(--muted)", fontSize: "0.8rem", marginTop: "4px" }}>
                  {user.email}
                </p>
                <div className="mt-2">
                  {user.role === "ADMIN" ? (
                    <Badge variant="gold">Admin</Badge>
                  ) : (
                    <Badge variant="default">Member</Badge>
                  )}
                </div>
              </div>

              <div
                className="w-full pt-4"
                style={{ borderTop: "1px solid rgba(196,162,74,0.06)" }}
              >
                <p className="label" style={{ color: "var(--muted)", fontSize: "0.58rem" }}>
                  Bergabung sejak
                </p>
                <p style={{ color: "var(--muted-light)", fontSize: "0.8rem", marginTop: "4px" }}>
                  {joinedDate}
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 w-full gap-3">
                {[
                  { value: user._count.orders, label: "Pesanan" },
                  { value: user._count.reviews, label: "Ulasan" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="p-3 text-center"
                    style={{ background: "var(--obsidian-800)" }}
                  >
                    <p
                      className="font-display text-2xl"
                      style={{ color: "var(--gold-400)" }}
                    >
                      {stat.value}
                    </p>
                    <p className="label" style={{ color: "var(--muted)", fontSize: "0.58rem" }}>
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — nav cards */}
          <div className="md:col-span-2 flex flex-col gap-4">
            {[
              {
                href: "/orders",
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                ),
                title: "Riwayat Pesanan",
                desc: `${user._count.orders} pesanan`,
              },
              {
                href: "/profile/addresses",
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                ),
                title: "Alamat Pengiriman",
                desc: `${user.addresses.length} alamat tersimpan`,
              },
              {
                href: "/profile/settings",
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
                  </svg>
                ),
                title: "Pengaturan Akun",
                desc: "Ubah password dan preferensi",
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-5 p-5 transition-all duration-200"
                style={{
                  background: "var(--obsidian-900)",
                  border: "1px solid rgba(196,162,74,0.08)",
                }}
              >
                <div
                  className="flex items-center justify-center w-11 h-11 flex-shrink-0 transition-colors duration-200"
                  style={{
                    border: "1px solid rgba(196,162,74,0.12)",
                    color: "var(--gold-500)",
                  }}
                >
                  {item.icon}
                </div>
                <div className="flex-1">
                  <p style={{ color: "var(--ivory-200)", fontWeight: 400 }}>
                    {item.title}
                  </p>
                  <p style={{ color: "var(--muted)", fontSize: "0.78rem", marginTop: "2px" }}>
                    {item.desc}
                  </p>
                </div>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="transition-transform duration-200 group-hover:translate-x-1"
                  style={{ color: "var(--muted)", flexShrink: 0 }}
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
