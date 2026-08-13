Write-Host "=== P0.4.2 TARGET URL FORENSIC ==="

Write-Host "`n--- DATASOURCE BLOCK ---"
Get-Content .\prisma\schema.prisma |
    Select-String -Pattern 'datasource db|provider|url|directUrl|shadowDatabaseUrl' -Context 0,2

Write-Host "`n--- ENV URL VARIABLE NAMES ONLY ---"
Get-ChildItem Env: |
    Where-Object { $_.Name -match '^(DATABASE_URL|DIRECT_URL|SHADOW_DATABASE_URL)$' } |
    Select-Object Name

Write-Host "`n--- ENV DATABASE NAMES (NO CREDENTIALS) ---"
# Check process environment
foreach ($name in @("DATABASE_URL","DIRECT_URL","SHADOW_DATABASE_URL")) {
    $value = [Environment]::GetEnvironmentVariable($name)
    if ($value) {
        try {
            $u = [System.Uri]$value
            Write-Host "ENV:$name => host=$($u.Host) port=$($u.Port) database=$($u.AbsolutePath.TrimStart('/'))"
        } catch {
            Write-Host "ENV:$name => PRESENT_BUT_UNPARSEABLE"
        }
    } else {
        Write-Host "ENV:$name => NOT_SET"
    }
}

# Also check .env file safely
Write-Host "`n--- .ENV FILE DATABASE NAMES (NO CREDENTIALS) ---"
if (Test-Path .env) {
    Get-Content .env | ForEach-Object {
        if ($_ -match '^(DATABASE_URL|DIRECT_URL|SHADOW_DATABASE_URL)=(.*)$') {
            $name = $matches[1]
            $val = $matches[2]
            try {
                $u = [System.Uri]$val
                Write-Host "FILE:$name => host=$($u.Host) port=$($u.Port) database=$($u.AbsolutePath.TrimStart('/'))"
            } catch {
                Write-Host "FILE:$name => PRESENT_BUT_UNPARSEABLE"
            }
        }
    }
} else {
    Write-Host ".env FILE NOT FOUND"
}
