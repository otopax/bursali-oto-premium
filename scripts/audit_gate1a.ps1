Write-Host "=== P0.4.20.6 GATE 1A — LOCAL IMPORT TARGET AUDIT ==="
Write-Host ""
Write-Host "[1] import_p04.cjs"
Get-Content .\scripts\import_p04.cjs
Write-Host ""
Write-Host "[2] import_p04_production.cjs"
Get-Content .\scripts\import_p04_production.cjs
Write-Host ""
Write-Host "[3] Prisma datasource"
Get-Content .\prisma\schema.prisma | Select-String -Pattern 'datasource db|provider|url|directUrl'
Write-Host ""
Write-Host "[4] LOCAL DATABASE"
$env:DATABASE_URL="postgresql://admin:mysecretpassword@127.0.0.1:5433/bursali_oto?schema=public"
node .\scripts\check_prod_counts.cjs
