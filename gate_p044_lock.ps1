$env:DATABASE_URL = "postgresql://admin:mysecretpassword@127.0.0.1:5433/disposable_import_p04?schema=public"
$env:DIRECT_URL   = "postgresql://admin:mysecretpassword@127.0.0.1:5433/disposable_import_p04?schema=public"

Write-Host "=== P0.4.4 PRE-PUSH TARGET LOCK ==="

Write-Host "DATABASE_URL:"
$env:DATABASE_URL | Out-String | Write-Host -NoNewline

Write-Host "`nRAILWAY VARIABLES:"
Get-ChildItem Env: |
    Where-Object {
        $_.Name -match 'RAILWAY|DATABASE_URL|DIRECT_URL|POSTGRES'
    } |
    ForEach-Object {
        if ($_.Name -match 'PASSWORD|TOKEN|SECRET') {
            "$($_.Name)=<REDACTED>"
        } else {
            "$($_.Name)=$($_.Value)"
        }
    } | Out-String | Write-Host -NoNewline

Write-Host "`nPRISMA DATASOURCE:"
npx prisma migrate status 2>&1 | Out-String | Write-Host
