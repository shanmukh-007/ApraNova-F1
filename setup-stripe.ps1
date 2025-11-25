# Stripe Integration Setup Script for Windows
# Run this script to install Stripe dependencies

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Stripe Payment Integration Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
Write-Host ""

# Navigate to frontend directory
Write-Host "Navigating to frontend directory..." -ForegroundColor Yellow
if (!(Test-Path "frontend")) {
    Write-Host "❌ Frontend directory not found!" -ForegroundColor Red
    exit 1
}
Set-Location frontend

# Install Stripe dependencies
Write-Host "Installing Stripe dependencies..." -ForegroundColor Yellow
Write-Host "Running: npm install @stripe/stripe-js @stripe/react-stripe-js" -ForegroundColor Cyan
npm install @stripe/stripe-js @stripe/react-stripe-js

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install Stripe dependencies!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host "✅ Stripe dependencies installed successfully!" -ForegroundColor Green
Write-Host ""

# Return to root directory
Set-Location ..

# Check if .env file exists
Write-Host "Checking environment configuration..." -ForegroundColor Yellow
if (!(Test-Path ".env")) {
    Write-Host "⚠️  .env file not found!" -ForegroundColor Yellow
    Write-Host "Creating .env file from template..." -ForegroundColor Yellow
    
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "✅ .env file created from .env.example" -ForegroundColor Green
    } else {
        Write-Host "❌ .env.example not found!" -ForegroundColor Red
    }
}

# Check for Stripe keys in .env
Write-Host ""
Write-Host "Checking Stripe configuration..." -ForegroundColor Yellow
$envContent = Get-Content ".env" -Raw
if ($envContent -match "STRIPE_SECRET_KEY=sk_") {
    Write-Host "✅ STRIPE_SECRET_KEY found in .env" -ForegroundColor Green
} else {
    Write-Host "⚠️  STRIPE_SECRET_KEY not configured in .env" -ForegroundColor Yellow
    Write-Host "   Please add your Stripe secret key to .env file" -ForegroundColor Yellow
}

if ($envContent -match "STRIPE_PUBLISHABLE_KEY=pk_") {
    Write-Host "✅ STRIPE_PUBLISHABLE_KEY found in .env" -ForegroundColor Green
} else {
    Write-Host "⚠️  STRIPE_PUBLISHABLE_KEY not configured in .env" -ForegroundColor Yellow
    Write-Host "   Please add your Stripe publishable key to .env file" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Get your Stripe API keys from: https://dashboard.stripe.com/test/apikeys" -ForegroundColor White
Write-Host "2. Add them to your .env file:" -ForegroundColor White
Write-Host "   STRIPE_SECRET_KEY=sk_test_..." -ForegroundColor Cyan
Write-Host "   STRIPE_PUBLISHABLE_KEY=pk_test_..." -ForegroundColor Cyan
Write-Host "3. Start your services:" -ForegroundColor White
Write-Host "   Backend:  docker-compose up" -ForegroundColor Cyan
Write-Host "   Frontend: cd frontend && npm run dev" -ForegroundColor Cyan
Write-Host "4. Test payment flow at: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "📚 For detailed instructions, see: STRIPE_INTEGRATION_GUIDE.md" -ForegroundColor Yellow
Write-Host ""
