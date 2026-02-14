# Run Chaos E2E Tests
Write-Host "============================" -ForegroundColor Yellow
Write-Host "RUNNING CHAOS E2E TESTS" -ForegroundColor Yellow
Write-Host "============================" -ForegroundColor Yellow

$env:NODE_ENV = "test"
$env:DATABASE_URL = "postgresql://test_user:test_password@localhost:5432/test_db?schema=public"

# Ensure schema is synced
npx prisma db push --skip-generate --accept-data-loss

# Run Jest targeting only the chaos spec
npm run test:e2e -- test/chaos.e2e-spec.ts

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host "CHAOS TESTS PASSED!" -ForegroundColor Green -BackgroundColor Black
    Write-Host "========================================" -ForegroundColor Green
} else {
    Write-Host "`n========================================" -ForegroundColor Red
    Write-Host "CHAOS TESTS FAILED!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    exit 1
}
