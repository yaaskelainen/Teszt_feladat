$env:NODE_ENV = "test"
$env:DATABASE_URL = "postgresql://test_user:test_password@localhost:5432/test_db?schema=public"

npx jest --config test/jest-e2e.json --runInBand "persistence|ai|auth|audit-persistence"
if ($LASTEXITCODE -eq 0) {
    Write-Host "Integration Tests Passed!" -ForegroundColor Green
} else {
    Write-Host "Integration Tests Failed!" -ForegroundColor Red
    exit $LASTEXITCODE
}
