$env:NODE_ENV = "test"
$env:DATABASE_URL = "postgresql://test_user:test_password@localhost:5432/test_db?schema=public"

npx jest --config test/jest-e2e.json --runInBand "event|admin|helpdesk|security|chaos|app|hard-limits|performance|audit"
if ($LASTEXITCODE -eq 0) {
    Write-Host "Journey E2E Tests Passed!" -ForegroundColor Green
} else {
    Write-Host "Journey E2E Tests Failed!" -ForegroundColor Red
    exit $LASTEXITCODE
}
