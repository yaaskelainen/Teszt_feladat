# Run All Tests (Unit + Integration + E2E) with Managed Infrastructure
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $scriptPath
Set-Location .. # Move to backend root

Write-Host "============================" -ForegroundColor Yellow
Write-Host "RUNNING FULL TEST SUITE" -ForegroundColor Yellow
Write-Host "============================" -ForegroundColor Yellow

$overallSuccess = $true
$env:NODE_ENV = "test"
$env:DATABASE_URL = "postgresql://test_user:test_password@localhost:5432/test_db?schema=public"

try {
    Write-Host "`n[STEP 0/4] Starting Infrastructure..." -ForegroundColor Cyan
    docker-compose -f docker-compose.yml up -d postgres
    
    Write-Host "Waiting for database to be ready..." -ForegroundColor Gray
    $retryCount = 0
    while ($retryCount -lt 15) {
        $check = docker exec event-manager-db pg_isready -U test_user -d test_db 2>$null
        if ($LASTEXITCODE -eq 0) { 
            Write-Host "Database is ready!" -ForegroundColor Green
            break 
        }
        $retryCount++
        Start-Sleep -Seconds 2
    }
    
    if ($retryCount -eq 15) { throw "Database failed to start in time" }

    Write-Host "Preparing database schema..." -ForegroundColor Gray
    npx prisma db push --skip-generate
    if ($LASTEXITCODE -ne 0) { throw "Prisma schema sync failed" }

    Write-Host "`n[STEP 1/4] Running Unit Tests..." -ForegroundColor Cyan
    npx jest
    if ($LASTEXITCODE -ne 0) { $overallSuccess = $false }

    Write-Host "`n[STEP 2/4] Running Integration Tests..." -ForegroundColor Cyan
    npx jest --config test/jest-e2e.json --runInBand "persistence|ai|auth|audit-persistence"
    if ($LASTEXITCODE -ne 0) { $overallSuccess = $false }

    Write-Host "`n[STEP 3/4] Running Journey E2E Tests..." -ForegroundColor Cyan
    npx jest --config test/jest-e2e.json --runInBand "event|admin|helpdesk|security|chaos|app|hard-limits|performance|audit"
    if ($LASTEXITCODE -ne 0) { $overallSuccess = $false }

} catch {
    $errMsg = if ($_.Status) { $_.Status } else { $_.Exception.Message }
    Write-Host "`nERROR: $errMsg" -ForegroundColor Red
    $overallSuccess = $false
} finally {
    Write-Host "`n[STEP 4/4] Cleaning Up Infrastructure..." -ForegroundColor Cyan
    docker-compose -f docker-compose.yml down -v
}

# Handle overall result
if ($overallSuccess) {
    Write-Host "`n" + ("=" * 50) -ForegroundColor Green
    Write-Host " 🎉 ALL TEST LEVELS PASSED SUCCESSFULLY! 🎉 " -ForegroundColor Green -BackgroundColor Black
    Write-Host ("=" * 50) -ForegroundColor Green
    Write-Host "✅ Unit Tests: Passed" -ForegroundColor Green
    Write-Host "✅ Integration Tests: Passed" -ForegroundColor Green
    Write-Host "✅ Journey E2E Tests: Passed" -ForegroundColor Green
    Write-Host ("=" * 50) -ForegroundColor Green
} else {
    Write-Host "`n" + ("=" * 50) -ForegroundColor Red
    Write-Host " ❌ SOME TEST LEVELS FAILED! ❌ " -ForegroundColor Red -BackgroundColor Black
    Write-Host ("=" * 50) -ForegroundColor Red
    Write-Host "Please check the logs above for specific failures." -ForegroundColor Gray
    Write-Host ("=" * 50) -ForegroundColor Red
    exit 1
}
