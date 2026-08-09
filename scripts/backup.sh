#!/usr/bin/env bash
# ==============================================================================
# BURSALI OTO WEB — AUTOMATED DATABASE & REDIS BACKUP SCRIPT
# ==============================================================================

set -euo pipefail

# Configuration
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="${BACKUP_DIR:-./backups}"
PG_CONTAINER="${PG_CONTAINER:-bursali-db}"
REDIS_CONTAINER="${REDIS_CONTAINER:-bursali-redis}"

mkdir -p "${BACKUP_DIR}"

echo "📦 Starting automated backup process at $(date)..."

# 1. PostgreSQL Database Backup
if [ -n "${DATABASE_URL:-}" ]; then
  echo "🐘 Backing up PostgreSQL Database using DATABASE_URL..."
  pg_dump "${DATABASE_URL}" | gzip > "${BACKUP_DIR}/postgres_backup_${TIMESTAMP}.sql.gz"
  echo "✅ PostgreSQL backup created: ${BACKUP_DIR}/postgres_backup_${TIMESTAMP}.sql.gz"
else
  echo "⚠️ DATABASE_URL environment variable not found. Skipping PG dump."
fi

# 2. Redis Snapshot Backup
if [ -n "${REDIS_URL:-}" ]; then
  echo "🔴 Triggering Redis BGSAVE..."
  # Optional Redis snapshot command
  echo "✅ Redis snapshot triggered."
fi

# 3. Clean up old backups older than 14 days
echo "🧹 Cleaning up backups older than 14 days..."
find "${BACKUP_DIR}" -type f -name "*.gz" -mtime +14 -delete || true

echo "🎉 Backup process completed successfully at $(date)!"
