# Start Code Server (VS Code IDE) for Full Stack Development Track
# This script starts the Code Server service and opens it in the browser

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Code Server - Full Stack Development  " -ForegroundColor Cyan
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

# Start Code Server service
Write-Host "Starting Code Server..." -ForegroundColor Yellow
docker-compose up -d code-server

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Code Server is starting..." -ForegroundColor Green
    Write-Host ""
    
    Write-Host "Waiting for Code Server to be ready..." -ForegroundColor Yellow
    Write-Host "This may take 10-20 seconds..." -ForegroundColor Yellow
    
    # Wait for Code Server to be ready
    $maxAttempts = 20
    $attempt = 0
    $ready = $false
    
    while ($attempt -lt $maxAttempts -and -not $ready) {
        Start-Sleep -Seconds 2
        $attempt++
        
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:8080/healthz" -TimeoutSec 2 -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                $ready = $true
            }
        } catch {
            Write-Host "." -NoNewline
        }
    }
    
    Write-Host ""
    
    if ($ready) {
        Write-Host "✓ Code Server is ready!" -ForegroundColor Green
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "  Code Server Access Information" -ForegroundColor Cyan
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "URL:      http://localhost:8080" -ForegroundColor White
        Write-Host "Password: password123" -ForegroundColor White
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Opening Code Server in your browser..." -ForegroundColor Yellow
        Start-Process "http://localhost:8080"
    } else {
        Write-Host "⚠ Code Server is still starting..." -ForegroundColor Yellow
        Write-Host "Check logs with: docker-compose logs code-server" -ForegroundColor Yellow
        Write-Host "Access at: http://localhost:8080" -ForegroundColor Yellow
    }
} else {
    Write-Host "ERROR: Failed to start Code Server!" -ForegroundColor Red
    Write-Host "Check logs with: docker-compose logs code-server" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Useful Commands:" -ForegroundColor Cyan
Write-Host "  View logs:    docker-compose logs -f code-server" -ForegroundColor White
Write-Host "  Stop:         docker-compose stop code-server" -ForegroundColor White
Write-Host "  Restart:      docker-compose restart code-server" -ForegroundColor White
Write-Host "  Remove:       docker-compose down code-server" -ForegroundColor White
Write-Host ""
