$ErrorActionPreference = "Stop"

Write-Host "==============================================================="
Write-Host "P0.4.19.12 — LOCAL REGRESSION FORENSIC"
Write-Host "==============================================================="

# 1. Start the Next.js dev server on a custom port
Write-Host "Starting local dev server on port 3009..."
$process = Start-Process -FilePath "npx" -ArgumentList "next dev -p 3009" -PassThru -NoNewWindow -RedirectStandardOutput "dev_server.log" -RedirectStandardError "dev_server_err.log"

# Give it 15 seconds to boot
Start-Sleep -Seconds 15

# 2. Run the tests
$queries = @("radio", "fuel pump", "pump relay", "zzzz_nonexistent_123456", "radyo", "fren", "silecek", "yakıt", "pompa")
$results = @()

foreach ($q in $queries) {
    $url = "http://localhost:3009/api/search?q=[uri]::EscapeDataString($q)"
    $url = $url.Replace("[uri]::EscapeDataString($q)", [uri]::EscapeDataString($q))
    
    Write-Host "Testing: $url"
    
    try {
        $response = Invoke-WebRequest -Uri $url -Method Get -UseBasicParsing
        $json = $response.Content | ConvertFrom-Json
        
        $resObj = [PSCustomObject]@{
            query = $q
            status = $response.StatusCode
            fuseCount = if ($null -ne $json.results.fuses.count) { $json.results.fuses.count } else { 0 }
            faultCount = if ($null -ne $json.results.faults.count) { $json.results.faults.count } else { 0 }
            error = $null
        }
        $results += $resObj
    } catch {
        $status = if ($_.Exception.Response.StatusCode) { $_.Exception.Response.StatusCode } else { 500 }
        $body = if ($_.Exception.Response) { 
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $reader.ReadToEnd()
        } else { $_.Exception.Message }
        
        $resObj = [PSCustomObject]@{
            query = $q
            status = $status
            fuseCount = 0
            faultCount = 0
            error = $body
        }
        $results += $resObj
    }
}

# 3. Stop the server
Write-Host "Stopping dev server..."
Stop-Process -Id $process.Id -Force

# 4. Save evidence
$report = @{
    queries = $results
    dev_log = (Get-Content "dev_server.log" -Tail 20 | Out-String)
    err_log = (Get-Content "dev_server_err.log" -Tail 20 | Out-String)
}

$report | ConvertTo-Json -Depth 5 | Out-File "evidence/p04-19-12-local-regression.json"
Write-Host "Forensic complete. Results saved to evidence/p04-19-12-local-regression.json"
