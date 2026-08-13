Write-Host "=== P0.4.2 MIGRATION PREFLIGHT ==="
Write-Host ""
Write-Host "DATABASE: disposable_import_p04"
Write-Host "HOST: 127.0.0.1:5433"
Write-Host "PRODUCTION: NO"
Write-Host "RAILWAY: NO"
Write-Host ""
Write-Host "MIGRATION_DIRECTORY:"
$dirs = Get-ChildItem .\prisma\migrations -Directory | Sort-Object Name
foreach ($d in $dirs) { Write-Host $d.Name }
$migCount = $dirs.Count
Write-Host ""
Write-Host "PRISMA_MIGRATE_STATUS:"
$env:DATABASE_URL="postgresql://admin:mysecretpassword@127.0.0.1:5433/disposable_import_p04"
npx prisma migrate status 2>&1 | Out-String | Write-Host
Write-Host ""
Write-Host "RISKY_SQL_MATCHES:"
$risky = Get-ChildItem .\prisma\migrations -Recurse -Filter migration.sql | Select-String -Pattern 'DROP TABLE|DROP COLUMN|ALTER TABLE|TRUNCATE|DELETE FROM|CREATE EXTENSION|CREATE DATABASE'
if ($risky) {
    $risky | ForEach-Object { Write-Host "$($_.Path):$($_.LineNumber) $($_.Line)" }
} else {
    Write-Host "NONE"
}
Write-Host ""
Write-Host "MIGRATION_COUNT: $migCount"
Write-Host ""
Write-Host "MUTATION_EXECUTED: NO"
Write-Host "IMPORT_EXECUTED: NO"
