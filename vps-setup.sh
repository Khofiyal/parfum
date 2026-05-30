#!/bin/bash
# vps-setup.sh — Initial VPS Setup untuk Ubuntu 22.04
# Jalankan SEKALI sebagai root setelah VPS baru dibuat
# Usage: bash vps-setup.sh

set -euo pipefail

# ─── Konfigurasi — EDIT SESUAI KEBUTUHAN ─────────────────────────────────────
APP_USER="parfumapp"
APP_DIR="/var/www/parfum-store"
SSH_PORT=2222          # Ganti port SSH dari 22
DOMAIN="yourdomain.com"

echo "🚀 Mulai setup VPS Ubuntu 22.04..."

# ─── 1. Update sistem ────────────────────────────────────────────────────────
echo "📦 Update packages..."
apt-get update && apt-get upgrade -y

# ─── 2. Install packages dasar ───────────────────────────────────────────────
apt-get install -y \
    curl wget git unzip \
    nginx certbot python3-certbot-nginx \
    ufw fail2ban \
    mariadb-server redis-server \
    gnupg2 backblaze-b2 \
    htop ncdu tmux

# ─── 3. Buat non-root user untuk aplikasi ────────────────────────────────────
echo "👤 Membuat user ${APP_USER}..."
useradd -m -s /bin/bash -G sudo "${APP_USER}" || true

# ─── 4. Install Node.js via NVM ──────────────────────────────────────────────
echo "📦 Install Node.js 20..."
sudo -u "${APP_USER}" bash << 'EOF'
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    nvm install 20
    nvm use 20
    nvm alias default 20
    npm install -g pm2
EOF

# ─── 5. Konfigurasi SSH ──────────────────────────────────────────────────────
echo "🔒 Mengamankan SSH..."
cat >> /etc/ssh/sshd_config << EOF

# Parfum Store Security
Port ${SSH_PORT}
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys
X11Forwarding no
AllowAgentForwarding no
MaxAuthTries 3
LoginGraceTime 20
EOF

systemctl restart sshd

# ─── 6. UFW Firewall ─────────────────────────────────────────────────────────
echo "🔥 Konfigurasi UFW..."
ufw default deny incoming
ufw default allow outgoing
ufw allow ${SSH_PORT}/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# ─── 7. Fail2ban ────────────────────────────────────────────────────────────
echo "🛡️ Konfigurasi Fail2ban..."
cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 1h
findtime = 10m
maxretry = 5
banaction = ufw

[sshd]
enabled = true
port = ${SSH_PORT}
logpath = /var/log/auth.log
maxretry = 3
bantime = 24h

[nginx-http-auth]
enabled = true

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
action = iptables-multiport[name=ReqLimit, port="http,https", protocol=tcp]
logpath = /var/log/nginx/*.error.log
maxretry = 10
findtime = 600
bantime = 7200
EOF

systemctl enable fail2ban
systemctl start fail2ban

# ─── 8. MariaDB ─────────────────────────────────────────────────────────────
echo "🗄️ Konfigurasi MariaDB..."
mysql_secure_installation << 'EOF'
n
y
y
y
y
EOF

# Buat database dan user
mysql -u root << EOF
CREATE DATABASE IF NOT EXISTS parfum_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Read-write user untuk transaksi
CREATE USER IF NOT EXISTS 'rw_user'@'127.0.0.1' IDENTIFIED BY 'GANTI_PASSWORD_RW';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX ON parfum_db.* TO 'rw_user'@'127.0.0.1';

-- Read-only user untuk query produk
CREATE USER IF NOT EXISTS 'ro_user'@'127.0.0.1' IDENTIFIED BY 'GANTI_PASSWORD_RO';
GRANT SELECT ON parfum_db.* TO 'ro_user'@'127.0.0.1';

-- Backup user
CREATE USER IF NOT EXISTS 'backup_user'@'127.0.0.1' IDENTIFIED BY 'GANTI_PASSWORD_BACKUP';
GRANT SELECT, LOCK TABLES, SHOW VIEW, TRIGGER ON parfum_db.* TO 'backup_user'@'127.0.0.1';

FLUSH PRIVILEGES;
EOF

# Pastikan MariaDB hanya bind ke localhost
sed -i 's/^bind-address.*$/bind-address = 127.0.0.1/' /etc/mysql/mariadb.conf.d/50-server.cnf
systemctl restart mariadb

# ─── 9. Redis ───────────────────────────────────────────────────────────────
echo "📮 Konfigurasi Redis..."
# Set password dan bind ke localhost
REDIS_PASS=$(openssl rand -base64 32)
sed -i "s/^# requirepass.*/requirepass ${REDIS_PASS}/" /etc/redis/redis.conf
sed -i "s/^bind .*/bind 127.0.0.1/" /etc/redis/redis.conf
sed -i "s/^protected-mode.*/protected-mode yes/" /etc/redis/redis.conf

echo "⚠️  REDIS_PASSWORD: ${REDIS_PASS}"
echo "    Simpan password ini di .env.local!"

systemctl restart redis-server

# ─── 10. Setup direktori app ─────────────────────────────────────────────────
echo "📁 Setup direktori aplikasi..."
mkdir -p "${APP_DIR}"
chown "${APP_USER}:${APP_USER}" "${APP_DIR}"
mkdir -p /var/log/pm2
chown "${APP_USER}:${APP_USER}" /var/log/pm2
mkdir -p /var/backups/parfum-store
chown "${APP_USER}:${APP_USER}" /var/backups/parfum-store

# ─── 11. Nginx ──────────────────────────────────────────────────────────────
echo "🌐 Konfigurasi Nginx..."
systemctl enable nginx
systemctl start nginx

# ─── Done ───────────────────────────────────────────────────────────────────
echo ""
echo "✅ Setup VPS selesai!"
echo ""
echo "Langkah selanjutnya:"
echo "1. Upload SSH public key ke /home/${APP_USER}/.ssh/authorized_keys"
echo "2. Clone repo ke ${APP_DIR}"
echo "3. Salin .env.example ke .env.local dan isi semua nilai"
echo "4. Jalankan: npm ci && npm run db:migrate && npm run build"
echo "5. Konfigurasi Nginx: cp nginx.conf /etc/nginx/sites-available/parfum-store"
echo "6. Issue SSL: certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}"
echo "7. Start PM2: pm2 start ecosystem.config.js"
echo "8. Setup cron backup: crontab -e → 0 2 * * * /opt/scripts/backup.sh"
