# Test Superset Accessibility
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Testing Apache Superset" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Is Superset container running?
Write-Host "Test 1: Checking if Superset container is running..." -ForegroundColor Yellow
$container = docker ps --filter "name=apranova_superset" --format "{{.Names}}: {{.Status}}"
if ($container) {
    Write-Host "✓ Superset container is running" -ForegroundColor Green
    Write-Host "  $container" -ForegroundColor Gray
} else {
    Write-Host "✗ Superset container is NOT running" -ForegroundColor Red
    Write-Host "  Starting Superset..." -ForegroundColor Yellow
    docker-compose up -d superset
    Start-Sleep -Seconds 5
}
Write-Host ""

# Test 2: Is Superset healthy?
Write-Host "Test 2: Checking Superset health..." -ForegroundColor Yellow
try {
    $health = Invoke-WebRequest -Uri "http://localhost:8088/health" -TimeoutSec 5 -ErrorAction Stop
    if ($health.StatusCode -eq 200) {
        Write-Host "✓ Superset health check passed" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Superset health check failed" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 3: Can we access login page?
Write-Host "Test 3: Checking login page..." -ForegroundColor Yellow
try {
    $login = Invoke-WebRequest -Uri "http://localhost:8088/login/" -TimeoutSec 5 -ErrorAction Stop
    if ($login.StatusCode -eq 200) {
        Write-Host "✓ Login page is accessible" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Login page is NOT accessible" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 4: Check logs for errors
Write-Host "Test 4: Checking recent logs for errors..." -ForegroundColor Yellow
$logs = docker-compose logs --tail=20 superset 2>&1 | Select-String -Pattern "error|Error|ERROR|exception|Exception" -CaseSensitive
if ($logs) {
    Write-Host "⚠ Found errors in logs:" -ForegroundColor Yellow
    $logs | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
} else {
    Write-Host "✓ No errors found in recent logs" -ForegroundColor Green
}
Write-Host ""

# Test 5: Check port
Write-Host "Test 5: Checking if port 8088 is listening..." -ForegroundColor Yellow
$port = netstat -ano | findstr ":8088"
if ($port) {
    Write-Host "✓ Port 8088 is listening" -ForegroundColor Green
} else {
    Write-Host "✗ Port 8088 is NOT listening" -ForegroundColor Red
}
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Superset URL: http://localhost:8088" -ForegroundColor White
Write-Host "Username: admin" -ForegroundColor White
Write-Host "Password: admin" -ForegroundColor White
Write-Host ""
Write-Host "Opening Superset in browser..." -ForegroundColor Yellow
Start-Process "http://localhost:8088"
Write-Host ""
Write-Host "If Superset doesn't load:" -ForegroundColor Yellow
Write-Host "1. Wait 30 seconds and refresh" -ForegroundColor White
Write-Host "2. Try Ctrl+F5 (hard refresh)" -ForegroundColor White
Write-Host "3. Try incognito mode (Ctrl+Shift+N)" -ForegroundColor White
Write-Host "4. Check browser console (F12) for errors" -ForegroundColor White
Write-Host "5. See SUPERSET_NOT_LOADING_FIX.md for more help" -ForegroundColor White
Write-Host ""
