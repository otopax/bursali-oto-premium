Write-Host "=== P0.4.3 MIGRATION PROVENANCE FORENSIC ==="

Write-Host "`n--- MIGRATION TREE ---"
Get-ChildItem .\prisma\migrations -Directory |
    Sort-Object Name |
    Select-Object Name

Write-Host "`n--- FIRST MIGRATION SQL ---"
Get-Content ".\prisma\migrations\20260704133903_faz_a_faultcode_ai_alanlari\migration.sql"

Write-Host "`n--- ALL FaultCode CREATE/ALTER REFERENCES ---"
Get-ChildItem .\prisma\migrations -Recurse -Filter *.sql |
    Select-String -Pattern 'CREATE TABLE.*FaultCode|ALTER TABLE.*FaultCode|FaultCode' |
    Select-Object Path, LineNumber, Line

Write-Host "`n--- SCHEMA MODEL ---"
Select-String -Path ".\prisma\schema.prisma" -Pattern 'model FaultCode' -Context 0,35
