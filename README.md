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

---

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/yourname/parfum-store.git
cd parfum-store
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env.local
# Edit .env.local dengan nilai yang sesuai
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Jalankan migrasi
npm run db:migrate:dev

# Seed data awal
npm run db:seed
```

### 4. Development

```bash
npm run dev
```

Akses di: http://localhost:3000

**Akun dev:**
- Admin: `admin@parfumstore.com` / `Admin@123456`
- User: `user@test.com` / `User@123456`

---

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

## Deployment ke VPS

### Setup Server (pertama kali)

```bash
# Upload dan jalankan script setup
scp vps-setup.sh user@your-vps:/tmp/
ssh user@your-vps "bash /tmp/vps-setup.sh"
```

### Manual Deploy

```bash
# Clone repo
git clone https://github.com/yourname/parfum-store.git /var/www/parfum-store
cd /var/www/parfum-store

# Environment
cp .env.example .env.local
nano .env.local  # isi semua nilai

# Install & build
npm ci
npm run db:generate
npm run db:migrate
npm run build

# Nginx
cp nginx.conf /etc/nginx/sites-available/parfum-store
ln -s /etc/nginx/sites-available/parfum-store /etc/nginx/sites-enabled/
cp nginx-proxy-params.conf /etc/nginx/conf.d/proxy_params.conf
nginx -t && systemctl reload nginx

# SSL
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### CI/CD GitHub Actions

Tambahkan secrets di GitHub repository settings:
- `VPS_HOST` — IP address VPS
- `VPS_USER` — username (bukan root)
- `VPS_PORT` — SSH port (default: 2222)
- `VPS_SSH_KEY` — private key SSH
- `DEPLOY_PATH` — `/var/www/parfum-store`

Push ke branch `main` akan auto-deploy.

### Backup Otomatis

```bash
# Copy script
cp backup.sh /opt/scripts/backup.sh
chmod +x /opt/scripts/backup.sh

# Tambahkan ke crontab (backup jam 2 pagi)
crontab -e
# Tambahkan: 0 2 * * * /opt/scripts/backup.sh >> /var/log/backup.log 2>&1
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

## Environment Variables

Lihat `.env.example` untuk daftar lengkap semua variabel yang dibutuhkan.

---

## License

MIT
