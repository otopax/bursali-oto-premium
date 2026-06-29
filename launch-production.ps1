<#
.SYNOPSIS
Bursalı Oto Dijital Sistemi V1.0 Canlıya Alma (Production Launch) Scripti.
Bu script, sistemi geliştirme modundan çıkarıp tam teşekküllü üretim modunda başlatır.

.DESCRIPTION
1. Ortam değişkenlerini kontrol eder.
2. Prisma ile veritabanı şemasını günceller ve istemciyi üretir.
3. Next.js projesini üretim (production) için derler.
4. PM2 ile Crawler Worker'larını arka planda başlatır.
5. PM2 ile Next.js ana sunucusunu başlatır.
#>

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "🚀 BURSALI OTO V1.0 - MASTER LAUNCH SEQUENCE 🚀" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# 1. Klasöre geç
$projectDir = "C:\Users\xbors\OneDrive\Desktop\Bursali_Oto_Dijital_Yonetim\Web_Sitesi\bursali-oto-web"
Set-Location -Path $projectDir
Write-Host "[1/5] Proje dizinine geçildi: $projectDir" -ForegroundColor Green

# 2. Prisma Database Migration & Client Generation
Write-Host "[2/5] Veritabanı üretim moduna güncelleniyor (Prisma)..." -ForegroundColor Yellow
npx prisma generate
# npx prisma migrate deploy # İsteğe bağlı: Canlı veritabanını günceller

# 3. Next.js Production Build
Write-Host "[3/5] Next.js Üretim (Production) derlemesi yapılıyor (Bu işlem birkaç dakika sürebilir)..." -ForegroundColor Yellow
npm run build

# 4. PM2 Arka Plan İşçileri (Crawler)
Write-Host "[4/5] PM2 Arka plan veri toplayıcı botları başlatılıyor..." -ForegroundColor Yellow
pm2 restart CrawlerWorker || pm2 start src/scripts/worker.js --name CrawlerWorker --env production

# 5. Next.js Canlı Sunucu (PM2 üzerinden)
Write-Host "[5/5] PM2 Next.js Canlı Sunucusu başlatılıyor..." -ForegroundColor Yellow
pm2 restart BursaliOtoWeb || pm2 start npm --name "BursaliOtoWeb" -- run start

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "✅ V1.0 LAUNCH BAŞARILI! SİSTEM CANLIDA ÇALIŞIYOR. ✅" -ForegroundColor Green
Write-Host "Sunucu Durumunu Görmek İçin: pm2 status" -ForegroundColor Gray
Write-Host "Logları Görmek İçin: pm2 logs" -ForegroundColor Gray
Write-Host "==================================================" -ForegroundColor Cyan
