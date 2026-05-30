// src/app/admin/users/page.tsx
import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { Badge } from "@/components/ui/Badge";
import { AdminUserActions } from "@/components/admin/AdminUserActions";

export const metadata: Metadata = { title: "Manajemen Pengguna — Admin" };

interface Props {
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function AdminUsersPage({ searchParams }: Props) {
  const { page = "1", search } = await searchParams;
  const PAGE_SIZE = 25;
  const currentPage = Math.max(1, parseInt(page));
  const skip = (currentPage - 1) * PAGE_SIZE;

  const where = {
    role: "USER" as const,
    ...(search && {
      OR: [
        { name: { contains: search } },
        { email: { contains: search } },
      ],
    }),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
      select: {
        id: true, name: true, email: true, image: true,
        isSuspended: true, createdAt: true, emailVerified: true,
        _count: { select: { orders: true, reviews: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return (
    <div style={{ padding: "40px 32px" }}>
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-3">
          <div className="divider-gold w-6" />
          <span className="label" style={{ color: "var(--gold-500)" }}>Manajemen</span>
        </div>
        <h1 className="font-display font-light" style={{ color: "var(--ivory-100)", fontSize: "2.2rem" }}>
          Pengguna
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "0.82rem", marginTop: "4px" }}>
          {total.toLocaleString("id-ID")} total pengguna terdaftar
        </p>
      </div>

      {/* Search */}
      <form method="GET" className="mb-6 max-w-sm">
        <input
          name="search"
          defaultValue={search}
          placeholder="Cari nama atau email..."
          className="input-dark"
          style={{ fontSize: "0.82rem" }}
        />
      </form>

      {/* Table */}
      <div style={{ background: "var(--obsidian-900)", border: "1px solid rgba(196,162,74,0.08)" }}>
        {/* Header */}
        <div
          className="hidden md:grid grid-cols-12 gap-3 px-4 py-3 label"
          style={{ borderBottom: "1px solid rgba(196,162,74,0.06)", color: "var(--muted)", fontSize: "0.58rem" }}
        >
          <span className="col-span-4">Pengguna</span>
          <span className="col-span-2">Bergabung</span>
          <span className="col-span-2">Pesanan</span>
          <span className="col-span-2">Status</span>
          <span className="col-span-2 text-right">Aksi</span>
        </div>

        {users.length === 0 ? (
          <div className="py-16 text-center">
            <p style={{ color: "var(--muted-light)" }}>Tidak ada pengguna ditemukan</p>
          </div>
        ) : (
          users.map((user, i) => (
            <div
              key={user.id}
              className="grid grid-cols-12 gap-3 items-center px-4 py-4"
              style={{
                borderBottom: i < users.length - 1 ? "1px solid rgba(196,162,74,0.05)" : "none",
              }}
            >
              {/* User info */}
              <div className="col-span-12 md:col-span-4 flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center font-display text-sm flex-shrink-0"
                  style={{
                    background: "var(--obsidian-700)",
                    border: "1px solid rgba(196,162,74,0.1)",
                    color: "var(--gold-400)",
                  }}
                >
                  {user.image ? (
                    <img src={user.image} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    user.name?.charAt(0).toUpperCase() ?? "U"
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate" style={{ color: "var(--ivory-300)", fontSize: "0.82rem" }}>
                    {user.name ?? "—"}
                  </p>
                  <p className="truncate" style={{ color: "var(--muted)", fontSize: "0.72rem" }}>
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Joined */}
              <div className="hidden md:block col-span-2">
                <p style={{ color: "var(--muted-light)", fontSize: "0.75rem" }}>
                  {new Intl.DateTimeFormat("id-ID", { dateStyle: "short" }).format(user.createdAt)}
                </p>
                {!user.emailVerified && (
                  <p style={{ color: "#facc15", fontSize: "0.68rem" }}>Belum verifikasi</p>
                )}
              </div>

              {/* Orders */}
              <div className="hidden md:block col-span-2">
                <p style={{ color: "var(--muted-light)", fontSize: "0.75rem" }}>
                  {user._count.orders} pesanan
                </p>
                <p style={{ color: "var(--muted)", fontSize: "0.68rem" }}>
                  {user._count.reviews} ulasan
                </p>
              </div>

              {/* Status */}
              <div className="hidden md:block col-span-2">
                <Badge variant={user.isSuspended ? "error" : "success"}>
                  {user.isSuspended ? "Suspended" : "Aktif"}
                </Badge>
              </div>

              {/* Actions */}
              <div className="col-span-12 md:col-span-2 flex items-center justify-end gap-2">
                <AdminUserActions userId={user.id} isSuspended={user.isSuspended} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
