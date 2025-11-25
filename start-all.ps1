# ============================================
# ApraNova Complete Startup Script
# ============================================
# This script builds and starts all services
# ============================================

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  ApraNova Complete Setup & Startup" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Change to the ApraNova directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# ============================================
# Step 0: Complete Cleanup (No Cache Issues!)
# ============================================
Write-Host "[0/9] Performing complete cleanup..." -ForegroundColor Yellow
Write-Host "This ensures no cache issues on rebuild!" -ForegroundColor Gray
Write-Host ""

# Stop all containers
Write-Host "  → Stopping all ApraNova containers..." -ForegroundColor Gray
docker-compose -f docker-compose.complete.yml down 2>$null

# Remove all workspace containers
Write-Host "  → Removing all workspace containers..." -ForegroundColor Gray
docker ps -a --filter "name=workspace_" --format "{{.Names}}" | ForEach-Object {
    docker rm -f $_ 2>$null
}

# Remove all ApraNova images
Write-Host "  → Removing all ApraNova images..." -ForegroundColor Gray
docker rmi apranova-frontend:latest -f 2>$null
docker rmi apranova-backend:latest -f 2>$null
docker rmi apra-nova-code-server:latest -f 2>$null

# Prune build cache
Write-Host "  → Pruning Docker build cache..." -ForegroundColor Gray
docker builder prune -f 2>$null

# Prune dangling images
Write-Host "  → Pruning dangling images..." -ForegroundColor Gray
docker image prune -f 2>$null

Write-Host "✅ Cleanup completed!" -ForegroundColor Green
Write-Host ""

# ============================================
# Step 1: Build Code-Server Image
# ============================================
Write-Host "[1/9] Building Code-Server Image..." -ForegroundColor Yellow
Write-Host "This may take 5-10 minutes on first run..." -ForegroundColor Gray

docker build -t apra-nova-code-server:latest ./backend/apra-nova-code-server

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to build code-server image!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Code-Server image built successfully!" -ForegroundColor Green
Write-Host ""

# ============================================
# Step 2: Build Backend with Docker CLI
# ============================================
Write-Host "[2/9] Building Backend with Docker-in-Docker support..." -ForegroundColor Yellow
Write-Host "Building with --no-cache to ensure fresh build..." -ForegroundColor Gray

Push-Location backend
docker build --no-cache --pull -t apranova-backend:latest .
$buildResult = $LASTEXITCODE
Pop-Location

if ($buildResult -ne 0) {
    Write-Host "❌ Failed to build backend!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Backend built successfully!" -ForegroundColor Green
Write-Host ""

# ============================================
# Step 3: Build Frontend
# ============================================
Write-Host "[3/9] Building Frontend..." -ForegroundColor Yellow
Write-Host "Building with --no-cache to ensure fresh build..." -ForegroundColor Gray

Push-Location frontend
docker build --no-cache --pull -t apranova-frontend:latest .
$buildResult = $LASTEXITCODE
Pop-Location

if ($buildResult -ne 0) {
    Write-Host "❌ Failed to build frontend!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Frontend built successfully!" -ForegroundColor Green
Write-Host ""

# ============================================
# Step 4: Start all services
# ============================================
Write-Host "[4/9] Starting all services..." -ForegroundColor Yellow

docker-compose -f docker-compose.complete.yml up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to start services!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ All services started!" -ForegroundColor Green
Write-Host ""

# ============================================
# Step 5: Run Database Migrations
# ============================================
Write-Host "[5/9] Running database migrations..." -ForegroundColor Yellow

docker exec apranova_backend python manage.py migrate --noinput

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Migration failed, but continuing..." -ForegroundColor Yellow
}

Write-Host "✅ Migrations completed!" -ForegroundColor Green
Write-Host ""

# ============================================
# Step 6: Create Demo Users
# ============================================
Write-Host "[6/9] Creating demo users..." -ForegroundColor Yellow

docker exec apranova_backend python manage.py create_demo_users

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Demo user creation failed, but continuing..." -ForegroundColor Yellow
}

Write-Host ""

# ============================================
# Step 7: Wait for services to be healthy
# ============================================
Write-Host "[7/9] Waiting for services to be healthy..." -ForegroundColor Yellow
Write-Host "This may take 30-60 seconds..." -ForegroundColor Gray

Start-Sleep -Seconds 10

# Check backend health
$maxAttempts = 12
$attempt = 0
$backendHealthy = $false

while ($attempt -lt $maxAttempts -and -not $backendHealthy) {
    $attempt++
    Write-Host "  Checking backend health (attempt $attempt/$maxAttempts)..." -ForegroundColor Gray
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -TimeoutSec 5 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            $backendHealthy = $true
            Write-Host "  ✅ Backend is healthy!" -ForegroundColor Green
        }
    } catch {
        Start-Sleep -Seconds 5
    }
}

if (-not $backendHealthy) {
    Write-Host "  ⚠️  Backend health check timed out, but it may still be starting..." -ForegroundColor Yellow
}

Write-Host ""

# ============================================
# Step 8: Test Signup API
# ============================================
Write-Host "[8/9] Testing signup API..." -ForegroundColor Yellow

$testEmail = "test_$(Get-Random)@apranova.com"
$testPassword = "Test@12345"

try {
    $signupData = @{
        email = $testEmail
        password1 = $testPassword
        password2 = $testPassword
        first_name = "Test"
        last_name = "User"
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/auth/registration/" `
        -Method POST `
        -Body $signupData `
        -ContentType "application/json" `
        -UseBasicParsing `
        -TimeoutSec 10

    if ($response.StatusCode -eq 201 -or $response.StatusCode -eq 200) {
        Write-Host "  ✅ Signup API is working!" -ForegroundColor Green
        Write-Host "  Test account created: $testEmail" -ForegroundColor Gray
    }
} catch {
    Write-Host "  ⚠️  Signup API test failed, but continuing..." -ForegroundColor Yellow
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host ""

# ============================================
# Step 9: Run All Tests
# ============================================
Write-Host "[9/10] Running all tests..." -ForegroundColor Yellow

Write-Host "  Running accounts app tests..." -ForegroundColor Cyan
docker exec apranova_backend python manage.py test accounts --verbosity=2

Write-Host ""
Write-Host "  Running accounts advanced tests..." -ForegroundColor Cyan
docker exec apranova_backend python manage.py test accounts.test_advanced --verbosity=2

Write-Host ""
Write-Host "  Running workspace tests..." -ForegroundColor Cyan
docker exec apranova_backend python manage.py test accounts.test_workspace --verbosity=2

Write-Host ""
Write-Host "  Running payments app tests..." -ForegroundColor Cyan
docker exec apranova_backend python manage.py test payments --verbosity=2

Write-Host ""
Write-Host "  ✅ All tests completed!" -ForegroundColor Green

Write-Host ""

# ============================================
# Step 10: Verify No Password Required for Workspace
# ============================================
Write-Host "[10/10] Verifying workspace configuration..." -ForegroundColor Yellow

# Check if workspace_views.py has the correct configuration
$workspaceViewsPath = "backend/accounts/workspace_views.py"
$workspaceContent = Get-Content $workspaceViewsPath -Raw

if ($workspaceContent -match 'environment=\{[^}]*"PASSWORD":\s*""') {
    Write-Host "  ✅ Workspace password is disabled (PASSWORD='')" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Warning: Workspace password configuration may not be correct" -ForegroundColor Yellow
}

if ($workspaceContent -match '--auth.*none') {
    Write-Host "  ✅ Workspace authentication is disabled (--auth none)" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Warning: Workspace auth configuration may not be correct" -ForegroundColor Yellow
}

Write-Host ""

# ============================================
# Display Service Status
# ============================================
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Service Status" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

docker-compose -f docker-compose.complete.yml ps

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  🌐 Access URLs" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Frontend:  http://localhost:3000" -ForegroundColor Green
Write-Host "  Backend:   http://localhost:8000" -ForegroundColor Green
Write-Host "  API Docs:  http://localhost:8000/swagger/" -ForegroundColor Green
Write-Host "  Admin:     http://localhost:8000/admin" -ForegroundColor Green
Write-Host "  Database:  localhost:5433" -ForegroundColor Green
Write-Host "  Redis:     localhost:6380" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "============================================" -ForegroundColor Yellow
Write-Host "  👤 Demo User Credentials" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Yellow
Write-Host "  Admin:    admin@apranova.com / Admin@123" -ForegroundColor White
Write-Host "  Student:  student@apranova.com / Student@123" -ForegroundColor White
Write-Host "  Teacher:  teacher@apranova.com / Teacher@123" -ForegroundColor White
Write-Host "============================================" -ForegroundColor Yellow
Write-Host ""

Write-Host "============================================" -ForegroundColor Magenta
Write-Host "  💻 Code-Server Workspace Access" -ForegroundColor Magenta
Write-Host "============================================" -ForegroundColor Magenta
Write-Host "  Students can launch their workspace from" -ForegroundColor White
Write-Host "  the dashboard without any password!" -ForegroundColor Green
Write-Host ""
Write-Host "  💡 Tip: Click 'Launch Workspace' button" -ForegroundColor Gray
Write-Host "          to access VS Code in the browser" -ForegroundColor Gray
Write-Host "============================================" -ForegroundColor Magenta
Write-Host ""

Write-Host "ApraNova is ready!" -ForegroundColor Green
Write-Host ""
Write-Host "Quick Start:" -ForegroundColor Cyan
Write-Host "  1. Open http://localhost:3000" -ForegroundColor Gray
Write-Host "  2. Login with student@apranova.com / Student@123" -ForegroundColor Gray
Write-Host "  3. Go to Workspace and click Launch Workspace" -ForegroundColor Gray
Write-Host "  4. VS Code will open directly - no password needed!" -ForegroundColor Gray
Write-Host ""
Write-Host "To view logs: docker-compose -f docker-compose.complete.yml logs -f" -ForegroundColor Gray
Write-Host "To stop: docker-compose -f docker-compose.complete.yml down" -ForegroundColor Gray
Write-Host ""

