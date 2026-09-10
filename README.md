# Maison Parfum — E-Commerce

Website penjualan parfum premium dibangun dengan Next.js 15, Prisma, NextAuth v5, dan Midtrans.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, RSC, Server Actions) |
| Styling | TailwindCSS + Custom CSS Variables |
| Auth | NextAuth v5 (Google OAuth + Credentials) |
| Database | MariaDB + Prisma ORM |
| Cache | Redis (ioredis) |
| Payment | Midtrans Snap |
| Storage | Cloudflare R2 (S3-compatible) |
| Monitoring | Sentry |
| Server | Nginx + PM2 + Ubuntu 22.04 |
| CI/CD | GitHub Actions |


## Struktur Proyek

```
src/
├── app/                     # Next.js App Router
│   ├── (pages)/             # Halaman publik
│   ├── admin/               # Admin panel (protected)
│   ├── api/                 # API routes
│   │   ├── auth/            # NextAuth handlers
│   │   ├── upload/          # R2 presigned URL
│   │   └── webhooks/        # Midtrans webhook
│   ├── auth/                # Login, register, error pages
│   ├── cart/                # Keranjang belanja
│   ├── catalog/             # Katalog produk
│   ├── checkout/            # Checkout flow
│   ├── orders/              # Riwayat & detail pesanan
│   ├── products/            # Detail produk
│   └── profile/             # Profil pengguna
│
├── components/
│   ├── admin/               # Komponen admin panel
│   ├── auth/                # Form login/register
│   ├── cart/                # Cart components
│   ├── checkout/            # Checkout & address
│   ├── layout/              # Navbar, Footer
│   ├── product/             # Product card, gallery, filters
│   └── ui/                  # Button, Badge, Skeleton
│
└── lib/
    ├── actions/             # Server Actions
    │   ├── admin.ts         # Admin CRUD
    │   ├── addresses.ts     # Address management
    │   ├── cart.ts          # Cart operations
    │   ├── orders.ts        # Order creation
    │   └── products.ts      # Product queries
    ├── auth/                # NextAuth config
    ├── cache/               # Redis + rate limiting
    ├── db/                  # Prisma clients + audit log
    ├── payment/             # Midtrans integration
    ├── storage/             # Cloudflare R2
    └── validations/         # Zod schemas
```

---

## Security Checklist

- [x] HTTPS enforced (Nginx + Certbot)
- [x] Security headers (X-Frame-Options, CSP, HSTS, dll)
- [x] Rate limiting di API routes sensitif (Redis)
- [x] CSRF protection via NextAuth server actions
- [x] Validasi stok server-side saat checkout
- [x] Webhook Midtrans: verifikasi HMAC signature
- [x] Idempotency key untuk mencegah transaksi duplikat
- [x] Stok dikembalikan otomatis jika payment gagal/expired
- [x] Audit log semua transaksi penting
- [x] MariaDB & Redis bind ke 127.0.0.1
- [x] Password hash bcrypt cost factor 12
- [x] JWT rotation setiap 24 jam
- [x] UFW firewall (hanya port 80, 443, SSH custom)
- [x] Fail2ban untuk brute-force protection
- [x] Non-root user untuk menjalankan aplikasi
- [x] SSH key-only authentication
- [x] Backup terenkripsi GPG → Backblaze B2

---
