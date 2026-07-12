// Bursalı Oto - Otomatik Veritabanı Yedekleme (R1)
// PostgreSQL veritabanını pg_dump ile yedekler, eski yedekleri rotasyonla siler
// ve (opsiyonel) rclone remote'una harici kopya gönderir.
//
// Gereksinim: pg_dump PATH'te olmalı (Alpine: `apk add postgresql-client`,
//             Debian/Ubuntu: `apt-get install postgresql-client`).
//
// Kullanım:   node scripts/backup-db.js
//             (veya `npm run db:backup`)
//
// Geri yükleme (custom format):
//   pg_restore --clean --if-exists --no-owner -d "$DATABASE_URL" <dosya.dump>
//
// Ortam değişkenleri:
//   DATABASE_URL            (zorunlu)  PostgreSQL bağlantı dizesi
//   BACKUP_DIR              (ops.)     Yerel yedek klasörü — varsayılan ./backups
//   BACKUP_RETENTION_DAYS  (ops.)     Kaç günlük yedek tutulacak — varsayılan 7
//   BACKUP_RCLONE_REMOTE   (ops.)     rclone hedefi, örn "gdrive:bursali-yedek"
//                                     (Drive / S3 / R2 hepsi rclone ile desteklenir)

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(process.cwd(), '.env') });
require('dotenv').config({ path: path.join(process.cwd(), '.env.local') });

const BACKUP_DIR = process.env.BACKUP_DIR || path.join(process.cwd(), 'backups');
const RETENTION_DAYS = parseInt(process.env.BACKUP_RETENTION_DAYS || '7', 10);
const RCLONE_REMOTE = process.env.BACKUP_RCLONE_REMOTE || '';

// pg_dump, libpq bilinmeyen query parametrelerinde (?schema=public gibi Prisma'ya
// özgü olanlar) hata verir. sslmode gibi geçerli olanları koruyup schema'yı atarız.
function pgConnString(rawUrl) {
  try {
    const u = new URL(rawUrl);
    u.searchParams.delete('schema');
    u.searchParams.delete('pgbouncer');
    u.searchParams.delete('connection_limit');
    return u.toString();
  } catch {
    return rawUrl; // parse edilemezse olduğu gibi geç
  }
}

// YYYY-MM-DD_HHMMSS zaman damgası
function stamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return (
    `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}` +
    `_${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`
  );
}

function main() {
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) {
    console.error('❌ DATABASE_URL tanımlı değil — yedek alınamaz.');
    process.exit(1);
  }

  fs.mkdirSync(BACKUP_DIR, { recursive: true });

  const fileName = `bursali_oto_${stamp()}.dump`;
  const filePath = path.join(BACKUP_DIR, fileName);

  console.log(`🗄️  Yedekleme başlıyor → ${filePath}`);

  let dump;
  let useDocker = false;

  // Check if pg_dump exists locally
  const pgCheck = spawnSync(process.platform === 'win32' ? 'where' : 'which', ['pg_dump']);
  if (pgCheck.status !== 0) {
    // Fallback to docker
    console.log('ℹ️ Yerel pg_dump bulunamadı, Docker üzerinden deneniyor...');
    useDocker = true;
  }

  let dockerUrl = rawUrl;
  if (useDocker) {
    // Replace port 5433 (host) with 5432 (container) for internal docker execution
    dockerUrl = rawUrl.replace(':5433', ':5432');
  }
  const dumpArgs = ['-Fc', '--no-owner', '-f', filePath, pgConnString(rawUrl)];
  
  if (useDocker) {
    // Remove the -f arg because in docker exec we can't easily write to the host path unless mapped
    // Instead we redirect stdout to the filePath.
    dump = spawnSync('docker', ['exec', 'bursali_postgres', 'pg_dump', '-Fc', '--no-owner', pgConnString(dockerUrl)], { stdio: ['ignore', 'pipe', 'inherit'] });
    if (dump.status === 0) {
      fs.writeFileSync(filePath, dump.stdout);
    }
  } else {
    dump = spawnSync('pg_dump', dumpArgs, { stdio: ['ignore', 'inherit', 'inherit'] });
  }

  if (dump.error && !useDocker) {
    if (dump.error.code === 'ENOENT') {
      console.error('❌ pg_dump bulunamadı. postgresql-client kurulu olmalı veya Docker açık olmalı.');
    } else {
      console.error('❌ pg_dump çalıştırılamadı:', dump.error.message);
    }
    process.exit(1);
  }
  if (dump.status !== 0) {
    console.error(`❌ Yedekleme hata koduyla çıktı: ${dump.status}`);
    // Yarım kalan bozuk dosyayı temizle
    try { fs.unlinkSync(filePath); } catch {}
    process.exit(1);
  }

  const sizeMB = (fs.statSync(filePath).size / (1024 * 1024)).toFixed(2);
  console.log(`✅ Yedek alındı (${sizeMB} MB): ${fileName}`);

  // --- Rotasyon: RETENTION_DAYS'ten eski .dump dosyalarını sil ---
  const cutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;
  let removed = 0;
  for (const f of fs.readdirSync(BACKUP_DIR)) {
    if (!f.endsWith('.dump')) continue;
    const fp = path.join(BACKUP_DIR, f);
    if (fs.statSync(fp).mtimeMs < cutoff) {
      fs.unlinkSync(fp);
      removed++;
    }
  }
  if (removed > 0) {
    console.log(`🧹 Rotasyon: ${RETENTION_DAYS} günden eski ${removed} yedek silindi.`);
  }

  // --- Opsiyonel harici kopya (rclone) ---
  if (RCLONE_REMOTE) {
    console.log(`☁️  Harici kopya → ${RCLONE_REMOTE}`);
    const rc = spawnSync('rclone', ['copy', filePath, RCLONE_REMOTE], {
      stdio: ['ignore', 'inherit', 'inherit'],
    });
    if (rc.error || rc.status !== 0) {
      // Harici kopya başarısız olsa bile yerel yedek durduğu için hata değil, uyarı.
      console.warn('⚠️  Harici kopya başarısız — yerel yedek yerinde duruyor.');
    } else {
      console.log('✅ Harici kopya tamamlandı.');
    }
  } else {
    console.log('ℹ️  BACKUP_RCLONE_REMOTE tanımsız — sadece yerel yedek alındı.');
  }
}

main();
