# Run All Unit Tests
Write-Host "Starting Unit Tests..." -ForegroundColor Cyan
# Using simple pattern for Jest to find spec files in src
npx jest "src/.*spec.ts"
if ($LASTEXITCODE -eq 0) {
    Write-Host "Unit Tests Passed!" -ForegroundColor Green
} else {
    Write-Host "Unit Tests Failed!" -ForegroundColor Red
    exit $LASTEXITCODE
}
