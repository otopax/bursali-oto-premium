# R1 — Otomatik Veritabanı Yedekleme

`scripts/backup-db.js`: PostgreSQL veritabanını `pg_dump` ile yedekler, eski
yedekleri rotasyonla siler ve opsiyonel olarak rclone ile harici depoya kopyalar.

## Önkoşul

`pg_dump` sunucuda kurulu olmalı:

```bash
# Alpine (Docker imajı node:22-alpine)
apk add --no-cache postgresql-client

# Debian / Ubuntu
apt-get update && apt-get install -y postgresql-client
```

## Manuel çalıştırma

```bash
npm run db:backup
# veya
node scripts/backup-db.js
```

Yedekler `BACKUP_DIR` (varsayılan `./backups`) altına
`bursali_oto_YYYY-MM-DD_HHMMSS.dump` adıyla yazılır (custom format, sıkıştırılmış).

## Ortam değişkenleri (.env)

| Değişken | Varsayılan | Açıklama |
|---|---|---|
| `DATABASE_URL` | — (zorunlu) | PostgreSQL bağlantı dizesi |
| `BACKUP_DIR` | `./backups` | Yerel yedek klasörü |
| `BACKUP_RETENTION_DAYS` | `7` | Bu günden eski yedekler silinir |
| `BACKUP_RCLONE_REMOTE` | (boş) | rclone hedefi; boşsa sadece yerel yedek |

## Harici kopya (rclone) — Drive / S3 / R2

`rclone` tek araçla üçünü de destekler. Kurulum + hedef tanımı:

```bash
# rclone kur (Linux)
curl https://rclone.org/install.sh | sudo bash

# İnteraktif yapılandırma — "gdrive", "s3" veya "r2" adında bir remote oluştur
rclone config

# .env'e ekle (örnek Google Drive)
BACKUP_RCLONE_REMOTE="gdrive:bursali-yedek"
```

## Günlük otomatik çalıştırma

### Seçenek A — Sistem cron (önerilir, Linux sunucu)

Her gece 03:00'te:

```cron
0 3 * * * cd /uygulama/yolu/bursali-oto-web && /usr/bin/node scripts/backup-db.js >> /var/log/bursali-backup.log 2>&1
```

`crontab -e` ile ekle. `.env` yüklenmesi gerekiyorsa komutu bir wrapper
script'e alıp `set -a; . .env; set +a` ile source et.

### Seçenek B — PM2 cron_restart

`ecosystem.config.js` içine ayrı bir app olarak:

```js
{
  name: 'bursali-backup',
  script: 'scripts/backup-db.js',
  cron_restart: '0 3 * * *',
  autorestart: false,   // cron ile tetiklenir, sürekli çalışmaz
}
```

## Geri yükleme

```bash
# Tam geri yükleme (custom format)
pg_restore --clean --if-exists --no-owner -d "$DATABASE_URL" backups/bursali_oto_2026-07-04_030000.dump
```

## Migration ile ilişki

FaultCode AI alanları migration'ı
(`prisma/migrations/20260704133903_faz_a_faultcode_ai_alanlari/`) **ilk yedek
alındıktan sonra** uygulanmalıdır:

```bash
npm run db:backup                                       # 1) önce yedek
prisma db execute \
  --file prisma/migrations/20260704133903_faz_a_faultcode_ai_alanlari/migration.sql \
  --schema prisma/schema.prisma                         # 2) sonra migration
```
