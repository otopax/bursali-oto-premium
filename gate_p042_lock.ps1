Write-Host "=== P0.4.2 TARGET LOCK ==="
Write-Host ""

$envFile = Get-Content .env
$dbLine = $envFile | Where-Object { $_ -match '^DATABASE_URL=' }
$directLine = $envFile | Where-Object { $_ -match '^DIRECT_URL=' }

$env:DATABASE_URL = "postgresql://admin:mysecretpassword@127.0.0.1:5433/disposable_import_p04?schema=public"
$env:DIRECT_URL   = "postgresql://admin:mysecretpassword@127.0.0.1:5433/disposable_import_p04?schema=public"

$output = npx prisma migrate status 2>&1 | Out-String

$match = $output -match 'database "disposable_import_p04"'
$targetMatch = if ($match) { "YES" } else { "NO" }

Write-Host "DATABASE: disposable_import_p04"
Write-Host "HOST: 127.0.0.1"
Write-Host "PORT: 5433"
Write-Host "RAILWAY: NO"
Write-Host "PRODUCTION: NO"
Write-Host ""
Write-Host "Prisma reported database:"
Write-Host $output
Write-Host "TARGET MATCH:"
Write-Host $targetMatch
Write-Host ""
Write-Host "MUTATION:"
Write-Host "NO"
