Write-Host "=== P0.4.4 SCHEMA PROVISIONING ==="
$env:DATABASE_URL = "postgresql://admin:mysecretpassword@127.0.0.1:5433/disposable_import_p04?schema=public"
$env:DIRECT_URL   = "postgresql://admin:mysecretpassword@127.0.0.1:5433/disposable_import_p04?schema=public"

npx prisma db push 2>&1 | Out-String | Write-Host
Write-Host "=== P0.4.4 END ==="
