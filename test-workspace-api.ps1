# Test Workspace API
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Testing Workspace API" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Django is running
Write-Host "Checking if Django backend is running..." -ForegroundColor Yellow
try {
    $django = Invoke-WebRequest -Uri "http://localhost:8000" -TimeoutSec 2 -ErrorAction Stop
    Write-Host "✓ Django is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Django is NOT running" -ForegroundColor Red
    Write-Host "  Please start Django: python manage.py runserver" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Check if Superset is running
Write-Host "Checking if Superset is running..." -ForegroundColor Yellow
try {
    $superset = Invoke-WebRequest -Uri "http://localhost:8088/health" -TimeoutSec 2 -ErrorAction Stop
    Write-Host "✓ Superset is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Superset is NOT running" -ForegroundColor Red
    Write-Host "  Please start Superset: docker-compose up -d superset" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Instructions" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Make sure you have a Data Professional student account" -ForegroundColor White
Write-Host "   - Track should be 'DP'" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Login to the application" -ForegroundColor White
Write-Host "   - Go to http://localhost:3000/login" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Navigate to Workspace" -ForegroundColor White
Write-Host "   - Click 'Workspace' in the sidebar" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Click 'Launch Superset'" -ForegroundColor White
Write-Host "   - Should open http://localhost:8088" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Login to Superset" -ForegroundColor White
Write-Host "   - Username: admin" -ForegroundColor Gray
Write-Host "   - Password: admin" -ForegroundColor Gray
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Ready!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Both Django and Superset are running." -ForegroundColor Green
Write-Host "You can now test the workspace feature!" -ForegroundColor Green
Write-Host ""
