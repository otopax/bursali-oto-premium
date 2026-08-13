$root = "public/catalog"

Write-Host "=== P0.3.1 FINAL JSON FORENSIC RECONCILIATION ==="

# 1. Dataset totals
$files = Get-ChildItem $root -Recurse -Filter *.json -File

$totalFiles = $files.Count
$totalBytes = ($files | Measure-Object Length -Sum).Sum

Write-Host "JSON_FILES=$totalFiles"
Write-Host "TOTAL_BYTES=$totalBytes"

# 2. Collect normalized records
$records = New-Object System.Collections.Generic.List[object]

foreach ($file in $files) {
    try {
        $json = Get-Content $file.FullName -Raw | ConvertFrom-Json

        $relative = $file.FullName.Substring((Resolve-Path $root).Path.Length).TrimStart('\')
        $parts = $relative -split '\\'

        # Expected:
        # brand/model/year/fuseboxes.json
        $brand = if ($parts.Count -ge 4) { $parts[0] } else { $null }
        $model = if ($parts.Count -ge 4) { $parts[1] } else { $null }
        $year  = if ($parts.Count -ge 4) { $parts[2] } else { $null }

        foreach ($box in @($json)) {

            $fuses = @($box.fuses)

            $records.Add([PSCustomObject]@{
                File        = $relative
                Brand       = $brand
                Model       = $model
                Year        = $year
                BoxName     = [string]$box.boxName
                FuseCount   = $fuses.Count
                MissingBox  = [string]::IsNullOrWhiteSpace([string]$box.boxName)
                MissingFuse = ($fuses.Count -eq 0)
                Fuses       = $fuses
            })
        }
    }
    catch {
        Write-Host "PARSE_ERROR=$($file.FullName)"
    }
}

# 3. Basic cardinality
$totalBoxes = $records.Count
$totalFuses = ($records | Measure-Object FuseCount -Sum).Sum

Write-Host "TOTAL_FUSEBOXES=$totalBoxes"
Write-Host "TOTAL_FUSES=$totalFuses"

# 4. Missing data
$missingBox = @($records | Where-Object MissingBox).Count
$emptyFuseBoxes = @($records | Where-Object MissingFuse).Count

Write-Host "MISSING_BOX_NAME=$missingBox"
Write-Host "EMPTY_FUSEBOXES=$emptyFuseBoxes"

# 5. Brand / Model / Year
$uniqueBrands = @(
    $records |
    Where-Object Brand |
    Select-Object -ExpandProperty Brand -Unique
).Count

$uniqueModels = @(
    $records |
    Where-Object Model |
    ForEach-Object { "$($_.Brand)|$($_.Model)" } |
    Select-Object -Unique
).Count

$uniqueVehicleYears = @(
    $records |
    ForEach-Object { "$($_.Brand)|$($_.Model)|$($_.Year)" } |
    Select-Object -Unique
).Count

Write-Host "UNIQUE_BRANDS=$uniqueBrands"
Write-Host "UNIQUE_BRAND_MODEL_PAIRS=$uniqueModels"
Write-Host "UNIQUE_VEHICLE_YEAR_KEYS=$uniqueVehicleYears"

# 6. FuseBox duplicate candidates
$duplicateBoxes = @(
    $records |
    Group-Object Brand,Model,Year,BoxName |
    Where-Object Count -gt 1
)

Write-Host "DUPLICATE_FUSEBOX_GROUPS=$($duplicateBoxes.Count)"

# 7. Fuse field reconciliation
$totalFuseObjects = 0
$missingFuseId = 0
$missingFuseDescription = 0

$fuseIdentityList = New-Object System.Collections.Generic.List[string]

foreach ($r in $records) {
    foreach ($f in @($r.Fuses)) {

        $totalFuseObjects++

        $id = [string]$f.id
        $description = [string]$f.description

        if ([string]::IsNullOrWhiteSpace($id)) {
            $missingFuseId++
        }

        if ([string]::IsNullOrWhiteSpace($description)) {
            $missingFuseDescription++
        }

        if (-not [string]::IsNullOrWhiteSpace($id)) {
            $fuseIdentityList.Add(
                "$($r.Brand)|$($r.Model)|$($r.Year)|$($r.BoxName)|$id"
            )
        }
    }
}

$duplicateFuseKeys = @(
    $fuseIdentityList |
    Group-Object |
    Where-Object Count -gt 1
)

Write-Host "FUSE_OBJECTS=$totalFuseObjects"
Write-Host "FUSE_MISSING_ID=$missingFuseId"
Write-Host "FUSE_MISSING_DESCRIPTION=$missingFuseDescription"
Write-Host "DUPLICATE_FUSE_IDENTITY_GROUPS=$($duplicateFuseKeys.Count)"

# 8. Year format
$invalidYears = @(
    $records |
    Where-Object {
        $_.Year -notmatch '^[0-9]{4}$'
    }
)

Write-Host "INVALID_YEAR_PATHS=$($invalidYears.Count)"

# 9. Vauxhall exact reconciliation
$vauxhall = @(
    $records |
    Where-Object { $_.Brand -ieq "vauxhall" }
)

$vauxhallFiles = @(
    $files |
    Where-Object { $_.FullName -match '(?i)[\\/]vauxhall[\\/]' }
).Count

$vauxhallFuses = ($vauxhall | Measure-Object FuseCount -Sum).Sum

Write-Host "VAUXHALL_FILES=$vauxhallFiles"
Write-Host "VAUXHALL_FUSEBOXES=$($vauxhall.Count)"
Write-Host "VAUXHALL_FUSES=$vauxhallFuses"

Write-Host ""
Write-Host "=== P0.3.1 END ==="
