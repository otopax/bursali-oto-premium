Write-Host "=== P0.4.2 SCHEMA PROVISIONING ==="
Write-Host ""
$env:DATABASE_URL = "postgresql://admin:mysecretpassword@127.0.0.1:5433/disposable_import_p04?schema=public"
$env:DIRECT_URL   = "postgresql://admin:mysecretpassword@127.0.0.1:5433/disposable_import_p04?schema=public"

Write-Host "DATABASE: disposable_import_p04"
Write-Host "HOST: 127.0.0.1"
Write-Host "PORT: 5433"
Write-Host "RAILWAY: NO"
Write-Host "PRODUCTION: NO"
Write-Host ""
Write-Host "Deploying migrations..."
npx prisma migrate deploy 2>&1 | Out-String | Write-Host
Write-Host "=== P0.4.2 END ==="
