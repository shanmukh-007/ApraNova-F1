# Start Apache Superset for Data Professional Track
# This script starts the Superset service and opens it in the browser

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Apache Superset - Data Professional  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "Checking Docker..." -ForegroundColor Yellow
$dockerRunning = docker info 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Docker is not running!" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again." -ForegroundColor Red
    exit 1
}
Write-Host "✓ Docker is running" -ForegroundColor Green
Write-Host ""

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "WARNING: .env file not found!" -ForegroundColor Yellow
    Write-Host "Copying .env.example to .env..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✓ Created .env file" -ForegroundColor Green
    Write-Host "Please update the .env file with your configuration." -ForegroundColor Yellow
    Write-Host ""
}

# Start Superset service
Write-Host "Starting Apache Superset..." -ForegroundColor Yellow
docker-compose up -d superset

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Superset is starting..." -ForegroundColor Green
    Write-Host ""
    
    Write-Host "Waiting for Superset to be ready..." -ForegroundColor Yellow
    Write-Host "This may take 30-60 seconds on first run..." -ForegroundColor Yellow
    
    # Wait for Superset to be ready
    $maxAttempts = 30
    $attempt = 0
    $ready = $false
    
    while ($attempt -lt $maxAttempts -and -not $ready) {
        Start-Sleep -Seconds 2
        $attempt++
        
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:8088/health" -TimeoutSec 2 -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                $ready = $true
            }
        } catch {
            Write-Host "." -NoNewline
        }
    }
    
    Write-Host ""
    
    if ($ready) {
        Write-Host "✓ Superset is ready!" -ForegroundColor Green
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "  Superset Access Information" -ForegroundColor Cyan
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "URL:      http://localhost:8088" -ForegroundColor White
        Write-Host "Username: admin" -ForegroundColor White
        Write-Host "Password: admin" -ForegroundColor White
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Opening Superset in your browser..." -ForegroundColor Yellow
        Start-Process "http://localhost:8088"
    } else {
        Write-Host "⚠ Superset is still starting..." -ForegroundColor Yellow
        Write-Host "Check logs with: docker-compose logs superset" -ForegroundColor Yellow
        Write-Host "Access at: http://localhost:8088" -ForegroundColor Yellow
    }
} else {
    Write-Host "ERROR: Failed to start Superset!" -ForegroundColor Red
    Write-Host "Check logs with: docker-compose logs superset" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Useful Commands:" -ForegroundColor Cyan
Write-Host "  View logs:    docker-compose logs -f superset" -ForegroundColor White
Write-Host "  Stop:         docker-compose stop superset" -ForegroundColor White
Write-Host "  Restart:      docker-compose restart superset" -ForegroundColor White
Write-Host "  Remove:       docker-compose down superset" -ForegroundColor White
Write-Host ""
