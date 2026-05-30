#!/bin/bash
# backup.sh — Backup otomatis MariaDB
# Cron schedule: 0 2 * * * /opt/scripts/backup.sh >> /var/log/backup.log 2>&1
#
# Setup:
# 1. chmod +x backup.sh
# 2. Install Backblaze CLI: pip install b2
# 3. Setup GPG key: gpg --full-generate-key (pilih recipient yang cocok)
# 4. b2 authorize-account $B2_KEY_ID $B2_APPLICATION_KEY
# 5. Edit variabel di bawah ini
# 6. Tambahkan ke crontab: crontab -e

set -euo pipefail

# ─── Konfigurasi ──────────────────────────────────────────────────────────────
DB_NAME="parfum_db"
DB_USER="backup_user"
DB_PASS="${DB_PASSWORD}"          # Set di environment atau .bashrc
DB_HOST="127.0.0.1"
DB_PORT="3306"

BACKUP_DIR="/var/backups/parfum-store"
B2_BUCKET="${B2_BUCKET_NAME}"
GPG_RECIPIENT="${GPG_RECIPIENT}"

# Simpan backup lokal berapa hari
RETENTION_DAYS=7

# ─── Setup ────────────────────────────────────────────────────────────────────
mkdir -p "${BACKUP_DIR}"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/db_${DB_NAME}_${TIMESTAMP}.sql"
ENCRYPTED_FILE="${BACKUP_FILE}.gpg"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# ─── Dump database ────────────────────────────────────────────────────────────
log "🗄️  Mulai backup database ${DB_NAME}..."

mysqldump \
    --host="${DB_HOST}" \
    --port="${DB_PORT}" \
    --user="${DB_USER}" \
    --password="${DB_PASS}" \
    --ssl \
    --single-transaction \
    --routines \
    --triggers \
    --events \
    --hex-blob \
    --complete-insert \
    "${DB_NAME}" > "${BACKUP_FILE}"

if [ $? -ne 0 ]; then
    log "❌ GAGAL: mysqldump error"
    exit 1
fi

DUMP_SIZE=$(du -sh "${BACKUP_FILE}" | cut -f1)
log "✅ Dump selesai: ${DUMP_SIZE}"

# ─── Enkripsi dengan GPG ──────────────────────────────────────────────────────
log "🔐 Mengenkripsi backup..."

gpg \
    --batch \
    --yes \
    --trust-model always \
    --recipient "${GPG_RECIPIENT}" \
    --output "${ENCRYPTED_FILE}" \
    --encrypt "${BACKUP_FILE}"

if [ $? -ne 0 ]; then
    log "❌ GAGAL: enkripsi GPG error"
    rm -f "${BACKUP_FILE}"
    exit 1
fi

# Hapus file dump yang tidak terenkripsi
rm -f "${BACKUP_FILE}"

ENCRYPTED_SIZE=$(du -sh "${ENCRYPTED_FILE}" | cut -f1)
log "✅ Enkripsi selesai: ${ENCRYPTED_SIZE}"

# ─── Upload ke Backblaze B2 ───────────────────────────────────────────────────
log "☁️  Upload ke Backblaze B2..."

b2 file upload \
    --info "source=parfum-store" \
    --info "date=${TIMESTAMP}" \
    "${B2_BUCKET}" \
    "${ENCRYPTED_FILE}" \
    "database/$(basename ${ENCRYPTED_FILE})"

if [ $? -ne 0 ]; then
    log "❌ GAGAL: upload ke B2 error"
    exit 1
fi

log "✅ Upload ke B2 berhasil"

# ─── Hapus backup lokal lama ─────────────────────────────────────────────────
log "🧹 Membersihkan backup lokal lebih dari ${RETENTION_DAYS} hari..."
find "${BACKUP_DIR}" -name "*.gpg" -mtime +${RETENTION_DAYS} -delete

# ─── Hapus backup B2 lama (opsional) ─────────────────────────────────────────
# b2 rm --recursive b2://${B2_BUCKET}/database/ --older-than ${RETENTION_DAYS}d

# ─── Verifikasi integrity backup ─────────────────────────────────────────────
log "🔍 Verifikasi integrity backup..."
gpg --batch --decrypt "${ENCRYPTED_FILE}" | head -5 > /dev/null 2>&1

if [ $? -eq 0 ]; then
    log "✅ Backup terverifikasi — dapat di-decrypt"
else
    log "⚠️  WARNING: Backup tidak dapat di-decrypt!"
fi

log "🎉 Backup selesai: $(basename ${ENCRYPTED_FILE})"
log "────────────────────────────────────"
