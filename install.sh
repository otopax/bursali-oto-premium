#!/usr/bin/env bash
# =============================================================
# Bursalı Oto Servis — Yerel Geliştirme Kurulum Script'i
# Kullanım:  bash install.sh
# Stack: Next.js 15 (App Router) · Prisma + PostgreSQL(pgvector) · Redis/BullMQ · Gemini
# =============================================================
set -euo pipefail

cd "$(dirname "$0")"
echo "🚗 Bursalı Oto Servis — kurulum başlıyor..."

# ---- 1) Node kontrolü -----------------------------------------------------
if ! command -v node >/dev/null 2>&1; then
  echo "❌ Node.js bulunamadı. Node 20+ kurun: https://nodejs.org"; exit 1
fi
NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if [ "$NODE_MAJOR" -lt 18 ]; then
  echo "❌ Node 18+ gerekli (mevcut: $(node -v))"; exit 1
fi
echo "✅ Node $(node -v)"

# ---- 2) Bağımlılıklar (.npmrc: legacy-peer-deps=true) ---------------------
echo "📦 Bağımlılıklar kuruluyor..."
if [ -f package-lock.json ]; then
  npm ci --legacy-peer-deps || npm install --legacy-peer-deps
else
  npm install --legacy-peer-deps
fi

# ---- 3) .env şablonu ------------------------------------------------------
if [ ! -f .env ]; then
  echo "📝 .env yok — şablon oluşturuluyor (değerleri doldurun!)"
  cat > .env <<'EOF'
# --- Database (Postgres + pgvector) ---
DATABASE_URL="postgresql://USER:PASS@HOST:5432/railway"
DIRECT_URL="postgresql://USER:PASS@HOST:5432/railway"

# --- Redis (BullMQ / cache) ---
REDIS_URL="redis://HOST:6379"

# --- Rate limit (Edge middleware — Upstash REST) ---
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""

# --- AI (Gemini) ---
GEMINI_API_KEY=""
GOOGLE_GENERATIVE_AI_API_KEY=""   # GEMINI_API_KEY ile aynı değeri girin

# --- Auth ---
NEXTAUTH_SECRET="degistir-uzun-rastgele-bir-deger"
NEXTAUTH_URL="http://localhost:3000"

# --- Site / Analytics ---
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_GA_ID="G-3SNV6H5568"
EOF
  echo "⚠️  .env oluşturuldu. Değerleri doldurup script'i tekrar çalıştırın."
else
  echo "✅ .env mevcut"
fi

# ---- 4) Prisma ------------------------------------------------------------
echo "🗄️  Prisma client üretiliyor..."
npx prisma generate

read -r -p "Şemayı veritabanına push edelim mi? (prisma db push) [y/N] " ANS
if [[ "${ANS:-N}" =~ ^[Yy]$ ]]; then
  npx prisma db push
fi

# ---- 5) Embedding coverage kontrolü (opsiyonel) --------------------------
if [ -f src/scripts/check-embeddings.js ]; then
  read -r -p "Embedding coverage kontrol edilsin mi? [y/N] " ANS2
  if [[ "${ANS2:-N}" =~ ^[Yy]$ ]]; then
    node src/scripts/check-embeddings.js || echo "⚠️ check-embeddings başarısız (DB bağlantısını doğrulayın)."
  fi
fi

echo ""
echo "✅ Kurulum tamam. Sonraki adımlar:"
echo "  • Geliştirme :  npm run dev            → http://localhost:3000"
echo "  • Build      :  npm run build && npm start"
echo "  • Worker     :  npm run start:worker"
echo "                  ⚠️ NOT: worker.js '@/' alias + ESM kullanıyor; düz 'node' ile ÇALIŞMAZ."
echo "                     Düzeltme: devDeps'e 'tsx' ekleyip script'i 'tsx src/scripts/jobs/worker.js' yapın."
echo "  • Test       :  npm test    |  npm run test:e2e"
echo "  • Bundle     :  npm run analyze"
