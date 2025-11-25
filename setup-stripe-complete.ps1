# ApraNova Stripe Integration Setup Script (PowerShell)
# This script helps you set up Stripe integration for development

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "ApraNova Stripe Integration Setup" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    Write-Host "Creating .env from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ .env file created" -ForegroundColor Green
}

Write-Host ""
Write-Host "📝 Please provide your Stripe credentials:" -ForegroundColor Yellow
Write-Host ""

# Get Stripe keys
$STRIPE_PK = Read-Host "Enter your Stripe Publishable Key (pk_test_...)"
$STRIPE_SK = Read-Host "Enter your Stripe Secret Key (sk_test_...)"

# Update .env file
$envContent = Get-Content ".env"
$pkExists = $false
$skExists = $false

$newContent = $envContent | ForEach-Object {
    if ($_ -match "^STRIPE_PUBLISHABLE_KEY=") {
        $pkExists = $true
        "STRIPE_PUBLISHABLE_KEY=$STRIPE_PK"
    }
    elseif ($_ -match "^STRIPE_SECRET_KEY=") {
        $skExists = $true
        "STRIPE_SECRET_KEY=$STRIPE_SK"
    }
    else {
        $_
    }
}

if (-not $pkExists) {
    $newContent += "STRIPE_PUBLISHABLE_KEY=$STRIPE_PK"
}

if (-not $skExists) {
    $newContent += "STRIPE_SECRET_KEY=$STRIPE_SK"
}

$newContent | Set-Content ".env"

Write-Host ""
Write-Host "✅ Stripe keys added to .env" -ForegroundColor Green
Write-Host ""

# Check if Stripe CLI is installed
$stripeInstalled = Get-Command stripe -ErrorAction SilentlyContinue

if ($stripeInstalled) {
    Write-Host "✅ Stripe CLI is installed" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔧 Setting up webhook forwarding..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Run this command in a separate terminal:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  stripe listen --forward-to http://localhost:8000/api/payments/webhook/" -ForegroundColor White
    Write-Host ""
    Write-Host "Then copy the webhook signing secret (whsec_...) and add it to .env:" -ForegroundColor Yellow
    Write-Host "  STRIPE_WEBHOOK_SECRET=whsec_..." -ForegroundColor White
    Write-Host ""
}
else {
    Write-Host "⚠️  Stripe CLI not found" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To install Stripe CLI on Windows:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Using Scoop:" -ForegroundColor White
    Write-Host "    scoop install stripe" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  Or download from:" -ForegroundColor White
    Write-Host "    https://github.com/stripe/stripe-cli/releases" -ForegroundColor Gray
    Write-Host ""
}

Write-Host ""
Write-Host "📦 Running database migrations..." -ForegroundColor Yellow
Set-Location backend
python manage.py migrate payments
Set-Location ..

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "✅ Stripe Integration Setup Complete!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Start the backend server:" -ForegroundColor White
Write-Host "   cd backend ; python manage.py runserver" -ForegroundColor Gray
Write-Host ""
Write-Host "2. In another terminal, start Stripe webhook forwarding:" -ForegroundColor White
Write-Host "   stripe listen --forward-to http://localhost:8000/api/payments/webhook/" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Copy the webhook secret and add to .env:" -ForegroundColor White
Write-Host "   STRIPE_WEBHOOK_SECRET=whsec_..." -ForegroundColor Gray
Write-Host ""
Write-Host "4. Test with a payment using card: 4242 4242 4242 4242" -ForegroundColor White
Write-Host ""
Write-Host "📚 Full documentation: STRIPE_INTEGRATION_COMPLETE.md" -ForegroundColor Cyan
Write-Host ""
