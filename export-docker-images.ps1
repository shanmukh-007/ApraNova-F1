# ============================================
# ApraNova Docker Images Export Script
# ============================================
# This script exports all ApraNova Docker images
# for distribution to other machines

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  ApraNova Docker Images Export" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Create export directory
$exportDir = "apranova-docker-export"
if (Test-Path $exportDir) {
    Write-Host "Removing old export directory..." -ForegroundColor Yellow
    Remove-Item -Path $exportDir -Recurse -Force
}

Write-Host "Creating export directory..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path $exportDir | Out-Null

# Step 1: Build all images
Write-Host ""
Write-Host "[1/5] Building all Docker images..." -ForegroundColor Green
Write-Host "This ensures we have the latest versions..." -ForegroundColor Gray

# Build code-server
Write-Host ""
Write-Host "Building code-server image..." -ForegroundColor Yellow
docker build -t apra-nova-code-server:latest -f backend/apra-nova-code-server/Dockerfile backend/apra-nova-code-server/
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to build code-server image!" -ForegroundColor Red
    exit 1
}

# Build backend
Write-Host ""
Write-Host "Building backend image..." -ForegroundColor Yellow
docker build -t apranova-backend:latest -f backend/Dockerfile backend/
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to build backend image!" -ForegroundColor Red
    exit 1
}

# Build frontend
Write-Host ""
Write-Host "Building frontend image..." -ForegroundColor Yellow
Push-Location frontend
docker build --pull -t apranova-frontend:latest .
$buildResult = $LASTEXITCODE
Pop-Location

if ($buildResult -ne 0) {
    Write-Host "Failed to build frontend image!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "All images built successfully!" -ForegroundColor Green

# Step 2: Export images
Write-Host ""
Write-Host "[2/5] Exporting Docker images..." -ForegroundColor Green
Write-Host "This may take several minutes..." -ForegroundColor Gray

Write-Host ""
Write-Host "Exporting code-server image..." -ForegroundColor Yellow
docker save apra-nova-code-server:latest -o "$exportDir/code-server.tar"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to export code-server image!" -ForegroundColor Red
    exit 1
}

Write-Host "Exporting backend image..." -ForegroundColor Yellow
docker save apranova-backend:latest -o "$exportDir/backend.tar"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to export backend image!" -ForegroundColor Red
    exit 1
}

Write-Host "Exporting frontend image..." -ForegroundColor Yellow
docker save apranova-frontend:latest -o "$exportDir/frontend.tar"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to export frontend image!" -ForegroundColor Red
    exit 1
}

Write-Host "Exporting PostgreSQL image..." -ForegroundColor Yellow
docker pull postgres:15-alpine
docker save postgres:15-alpine -o "$exportDir/postgres.tar"

Write-Host "Exporting Redis image..." -ForegroundColor Yellow
docker pull redis:7-alpine
docker save redis:7-alpine -o "$exportDir/redis.tar"

Write-Host ""
Write-Host "All images exported successfully!" -ForegroundColor Green

# Step 3: Copy configuration files
Write-Host ""
Write-Host "[3/5] Copying configuration files..." -ForegroundColor Green

Copy-Item "docker-compose.distribution.yml" -Destination "$exportDir/docker-compose.yml"
Copy-Item ".env" -Destination "$exportDir/.env.example"

# Create README for distribution
$readmeContent = @"
# ApraNova Platform - Docker Distribution Package

This package contains all Docker images needed to run the ApraNova platform.

## System Requirements

- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Docker Compose
- Minimum 8GB RAM
- 20GB free disk space

## Installation Steps

### Windows

1. Install Docker Desktop from https://www.docker.com/products/docker-desktop

2. Open PowerShell and navigate to this directory

3. Run the import script:
   ``````powershell
   powershell -ExecutionPolicy Bypass -File .\import-and-run.ps1
   ``````

### Linux/Mac

1. Install Docker and Docker Compose

2. Open terminal and navigate to this directory

3. Run the import script:
   ``````bash
   chmod +x import-and-run.sh
   ./import-and-run.sh
   ``````

## Access the Platform

After successful startup:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin

## Default Credentials

Check the `.env` file for database credentials and other configuration.

## Stopping the Platform

``````bash
docker-compose down
``````

## Troubleshooting

If you encounter issues:

1. Make sure Docker is running
2. Check if ports 3000, 8000, 5433, 6380 are available
3. Run: ``docker-compose logs`` to see error messages

## Support

For issues and questions, please contact the ApraNova team.
"@

$readmeContent | Out-File -FilePath "$exportDir/README.md" -Encoding UTF8

Write-Host "Configuration files copied!" -ForegroundColor Green

# Step 4: Create import scripts
Write-Host ""
Write-Host "[4/5] Creating import scripts..." -ForegroundColor Green

# Windows import script
$importScriptWindows = @'
# ApraNova Docker Images Import and Run Script (Windows)

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  ApraNova Platform Setup" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "Checking Docker..." -ForegroundColor Yellow
docker version > $null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Docker is not running!" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again." -ForegroundColor Yellow
    exit 1
}
Write-Host "Docker is running!" -ForegroundColor Green

# Import images
Write-Host ""
Write-Host "[1/3] Importing Docker images..." -ForegroundColor Green
Write-Host "This may take 5-10 minutes..." -ForegroundColor Gray

Write-Host ""
Write-Host "Importing PostgreSQL..." -ForegroundColor Yellow
docker load -i postgres.tar

Write-Host "Importing Redis..." -ForegroundColor Yellow
docker load -i redis.tar

Write-Host "Importing code-server..." -ForegroundColor Yellow
docker load -i code-server.tar

Write-Host "Importing backend..." -ForegroundColor Yellow
docker load -i backend.tar

Write-Host "Importing frontend..." -ForegroundColor Yellow
docker load -i frontend.tar

Write-Host ""
Write-Host "All images imported successfully!" -ForegroundColor Green

# Setup environment
Write-Host ""
Write-Host "[2/3] Setting up environment..." -ForegroundColor Green

if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file from example..." -ForegroundColor Yellow
    Copy-Item ".env.example" -Destination ".env"
    Write-Host "Please review and update .env file if needed!" -ForegroundColor Yellow
}

# Start services
Write-Host ""
Write-Host "[3/3] Starting all services..." -ForegroundColor Green
docker-compose up -d

Write-Host ""
Write-Host "Waiting for services to be healthy..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Check status
Write-Host ""
Write-Host "Services Status:" -ForegroundColor Cyan
docker-compose ps

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  ApraNova Platform is Ready!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Access URLs:" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor Yellow
Write-Host "  Backend:  http://localhost:8000" -ForegroundColor Yellow
Write-Host "  Admin:    http://localhost:8000/admin" -ForegroundColor Yellow
Write-Host ""
'@

$importScriptWindows | Out-File -FilePath "$exportDir/import-and-run.ps1" -Encoding UTF8

# Linux/Mac import script
$importScriptLinux = @'
#!/bin/bash

echo "============================================"
echo "  ApraNova Platform Setup"
echo "============================================"
echo ""

# Check if Docker is running
echo "Checking Docker..."
if ! docker version > /dev/null 2>&1; then
    echo "ERROR: Docker is not running!"
    echo "Please start Docker and try again."
    exit 1
fi
echo "Docker is running!"

# Import images
echo ""
echo "[1/3] Importing Docker images..."
echo "This may take 5-10 minutes..."

echo ""
echo "Importing PostgreSQL..."
docker load -i postgres.tar

echo "Importing Redis..."
docker load -i redis.tar

echo "Importing code-server..."
docker load -i code-server.tar

echo "Importing backend..."
docker load -i backend.tar

echo "Importing frontend..."
docker load -i frontend.tar

echo ""
echo "All images imported successfully!"

# Setup environment
echo ""
echo "[2/3] Setting up environment..."

if [ ! -f ".env" ]; then
    echo "Creating .env file from example..."
    cp .env.example .env
    echo "Please review and update .env file if needed!"
fi

# Start services
echo ""
echo "[3/3] Starting all services..."
docker-compose up -d

echo ""
echo "Waiting for services to be healthy..."
sleep 15

# Check status
echo ""
echo "Services Status:"
docker-compose ps

echo ""
echo "============================================"
echo "  ApraNova Platform is Ready!"
echo "============================================"
echo ""
echo "Access URLs:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:8000"
echo "  Admin:    http://localhost:8000/admin"
echo ""
'@

$importScriptLinux | Out-File -FilePath "$exportDir/import-and-run.sh" -Encoding UTF8

Write-Host "Import scripts created!" -ForegroundColor Green

# Step 5: Show summary
Write-Host ""
Write-Host "[5/5] Export Summary" -ForegroundColor Green
Write-Host ""

$files = Get-ChildItem -Path $exportDir
$totalSize = ($files | Measure-Object -Property Length -Sum).Sum / 1GB

Write-Host "Exported Files:" -ForegroundColor Cyan
foreach ($file in $files) {
    $size = $file.Length / 1MB
    Write-Host "  $($file.Name) - $([math]::Round($size, 2)) MB" -ForegroundColor White
}

Write-Host ""
Write-Host "Total Size: $([math]::Round($totalSize, 2)) GB" -ForegroundColor Yellow
Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  Export Complete!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Distribution package created in: $exportDir" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Copy the '$exportDir' folder to another machine" -ForegroundColor White
Write-Host "2. On that machine, run the import script:" -ForegroundColor White
Write-Host "   Windows: powershell -ExecutionPolicy Bypass -File .\import-and-run.ps1" -ForegroundColor Gray
Write-Host "   Linux:   ./import-and-run.sh" -ForegroundColor Gray
Write-Host ""

