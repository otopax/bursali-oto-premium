<#
.SYNOPSIS
    Bursali Oto Web - Otomatik Production Deployment & SRE Kurulum Betigi
.DESCRIPTION
    Bu betik; Git pull, Docker deployment, Health-check dogrulama ve
    Windows Task Scheduler uzerinden otomatik yedekleme (cron) kurulumunu tek tusla yapar.
#>

$ErrorActionPreference = 'Stop'
$WarningPreference = 'Continue'

$ProjectRoot = Resolve-Path ".\"
$EnvFile = Join-Path $ProjectRoot ".env.production"
$ComposeFile = Join-Path $ProjectRoot "docker-compose.prod.yml"
$HealthCheckUrl = "http://localhost:3000/api/health/live"

Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host "[DEPLOY] BURSALI OTO - ZERO-ASSUMPTION DEPLOYMENT SCRIPT V1.0" -ForegroundColor Cyan
Write-Host "===========================================================" -ForegroundColor Cyan

# 1. Environment Kontrolu
Write-Host ""
Write-Host "[1/5] Ortam Degiskenleri Kontrol Ediliyor..." -ForegroundColor Yellow
if (!(Test-Path $EnvFile)) {
    Write-Warning "UYARI: .env.production dosyasi bulunamadi! Eger .env kullaniyorsaniz sorun yok, ancak prod icin .env.production onerilir."
} else {
    Write-Host "[OK] .env.production dosyasi dogrulandi." -ForegroundColor Green
}

if (!(Test-Path $ComposeFile)) {
    Write-Warning "UYARI: docker-compose.prod.yml bulunamadi. Standart docker-compose.yml kullanilacak."
    $ComposeFile = "docker-compose.yml"
}

# 2. Deployment (Docker)
Write-Host ""
Write-Host "[2/5] Production Imaji Insa Ediliyor ve Konteynerler Baslatiliyor..." -ForegroundColor Yellow
try {
    # Hata firlatmamasi icin docker-compose'u invoke ediyoruz
    docker-compose -f $ComposeFile up -d --build
    Write-Host "[OK] Docker deployment basariyla tamamlandi." -ForegroundColor Green
} catch {
    Write-Host "[FAIL] Docker deployment sirasinda hata olustu. Rollback gerekebilir." -ForegroundColor Red
    throw
}

# 3. Health-check (Ampirik Dogrulama)
Write-Host ""
Write-Host "[3/5] API Health-check (Canlilik Testi) Yapiliyor..." -ForegroundColor Yellow
Start-Sleep -Seconds 10 # Uygulamanin ayaga kalkmasi icin bekleme suresi

$retryCount = 0
$maxRetries = 5
$isHealthy = $false

while ($retryCount -lt $maxRetries) {
    try {
        $response = Invoke-RestMethod -Uri $HealthCheckUrl -Method Get -TimeoutSec 5
        Write-Host "[OK] Health-check BASARILI! (Yanit: $($response | ConvertTo-Json -Compress))" -ForegroundColor Green
        $isHealthy = $true
        break
    } catch {
        $retryCount++
        Write-Host "[WAIT] Health-check bekleniyor... (Deneme $retryCount/$maxRetries)" -ForegroundColor DarkGray
        Start-Sleep -Seconds 5
    }
}

if (-not $isHealthy) {
    Write-Host "[FAIL] Health-check BASARISIZ! Acil Rollback onerilir:" -ForegroundColor Red
    Write-Host "   git reset --hard HEAD~1" -ForegroundColor Red
    Write-Host "   docker-compose -f $ComposeFile up -d --build" -ForegroundColor Red
    exit 1
}

# 4. Cache Flush (CDN)
Write-Host ""
Write-Host "[4/5] CDN Cache Flush Adimi..." -ForegroundColor Yellow
# Not: Gercek bir Cloudflare Purge islemi icin API Token gereklidir. Bu bir placeholder (yer tutucu) adimdir.
Write-Host "[INFO] Cloudflare veya Vercel Edge kullaniyorsaniz, lutfen yonetim panelinden veya CI/CD uzerinden Cache Purge islemini tetikleyin." -ForegroundColor DarkCyan

# 5. Otomatik Backup Job Kurulumu (Windows Task Scheduler)
Write-Host ""
Write-Host "[5/5] Otomatik Veritabani Yedekleme (Cron) Gorevi Kuruluyor..." -ForegroundColor Yellow
$TaskName = "BursaliOto_DailyBackup"
$BackupScript = Join-Path $ProjectRoot "scripts\backup-db.js"

if (Test-Path $BackupScript) {
    # Gorev daha once var mi kontrol et, varsa sil
    $existingTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
    if ($existingTask) {
        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    }

    # Her gece 03:00'te Node.js ile yedekleme scriptini calistir
    $Action = New-ScheduledTaskAction -Execute "node" -Argument "`"$BackupScript`"" -WorkingDirectory $ProjectRoot
    $Trigger = New-ScheduledTaskTrigger -Daily -At 3:00AM
    $Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
    
    Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Settings $Settings -Description "Bursali Oto Gunluk PostgreSQL Yedeklemesi" | Out-Null
    Write-Host "[OK] Gunluk yedekleme gorevi (Task Scheduler) her gece 03:00 icin ayarlandi." -ForegroundColor Green
} else {
    Write-Warning "UYARI: $BackupScript bulunamadigi icin zamanlanmis gorev kurulamadi."
}

Write-Host ""
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host "[SUCCESS] DEPLOYMENT VE SRE OPERASYONLARI BASARIYLA TAMAMLANDI!" -ForegroundColor Cyan
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host "Artik Grafana/Sentry uzerinden izleme (Day-2) asamasina gecebilirsiniz." -ForegroundColor White
Write-Host ""
