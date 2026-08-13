Write-Host "=== P0.4.20.6 GATE 0 — DISPOSABLE DB DISCOVERY ==="

Write-Host "`n[1] ENV NAMES ONLY"
Get-ChildItem Env: |
  Where-Object {
    $_.Name -match 'DATABASE|POSTGRES|RAILWAY|DB_URL'
  } |
  Select-Object Name | Format-Table -AutoSize

Write-Host "`n[2] PROJECT ENV FILE NAMES"
Get-ChildItem -Force -File |
  Where-Object {
    $_.Name -match '^\.env'
  } |
  Select-Object Name | Format-Table -AutoSize

Write-Host ""
Write-Host "[3] SCRIPT REFERENCES (Redacted Lines)"
Get-ChildItem -Path . -Recurse -File -Exclude node_modules,.git,.next,dist,*.json,*.sql -ErrorAction SilentlyContinue |
  Select-String -Pattern 'disposable_import_p04|DATABASE_URL|DIRECT_URL' -SimpleMatch |
  Select-Object Path,LineNumber | 
  Format-Table -AutoSize
