# Test Stripe Integration
# This script tests your Stripe payment flow

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Testing ApraNova Stripe Integration" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check if backend is running
Write-Host "1. Checking if backend is running..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -Method GET -ErrorAction Stop
    Write-Host "   ✅ Backend is running" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Backend is not running!" -ForegroundColor Red
    Write-Host "   Start it with: cd backend ; python manage.py runserver" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "2. Testing Stripe configuration..." -ForegroundColor Yellow

# Check if Stripe keys are configured
$envContent = Get-Content ".env" -Raw
if ($envContent -match "STRIPE_SECRET_KEY=sk_test_") {
    Write-Host "   ✅ Stripe secret key configured" -ForegroundColor Green
} else {
    Write-Host "   ❌ Stripe secret key not configured" -ForegroundColor Red
    exit 1
}

if ($envContent -match "STRIPE_PUBLISHABLE_KEY=pk_test_") {
    Write-Host "   ✅ Stripe publishable key configured" -ForegroundColor Green
} else {
    Write-Host "   ❌ Stripe publishable key not configured" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "3. Creating test user..." -ForegroundColor Yellow

$signupData = @{
    email = "stripe-test@apranova.com"
    username = "stripetest"
    password = "TestPass123!"
    password2 = "TestPass123!"
    name = "Stripe Test User"
    role = "student"
    track = "DP"
    privacy_accepted = $true
    privacy_version = "1.0"
} | ConvertTo-Json

try {
    $signupResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/registration/" `
        -Method POST `
        -Body $signupData `
        -ContentType "application/json" `
        -ErrorAction Stop
    
    Write-Host "   ✅ Test user created" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "   ℹ️  User already exists, continuing..." -ForegroundColor Yellow
    } else {
        Write-Host "   ❌ Failed to create user: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "4. Logging in..." -ForegroundColor Yellow

$loginData = @{
    email = "stripe-test@apranova.com"
    password = "TestPass123!"
    role = "student"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/login/" `
        -Method POST `
        -Body $loginData `
        -ContentType "application/json" `
        -ErrorAction Stop
    
    $accessToken = $loginResponse.access
    Write-Host "   ✅ Login successful" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "5. Creating payment intent..." -ForegroundColor Yellow

$paymentData = @{
    track = "DP"
} | ConvertTo-Json

try {
    $paymentResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/payments/create-payment/" `
        -Method POST `
        -Body $paymentData `
        -ContentType "application/json" `
        -Headers @{Authorization = "Bearer $accessToken"} `
        -ErrorAction Stop
    
    Write-Host "   ✅ Payment intent created" -ForegroundColor Green
    Write-Host "   Payment Intent ID: $($paymentResponse.paymentIntentId)" -ForegroundColor Cyan
    Write-Host "   Amount: `$$($paymentResponse.amount / 100)" -ForegroundColor Cyan
    Write-Host "   Client Secret: $($paymentResponse.clientSecret.Substring(0, 20))..." -ForegroundColor Cyan
} catch {
    Write-Host "   ❌ Failed to create payment: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "✅ Stripe Integration Test Passed!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Set up webhook forwarding:" -ForegroundColor White
Write-Host "   stripe listen --forward-to http://localhost:8000/api/payments/webhook/" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Copy the webhook secret (whsec_...) to .env file" -ForegroundColor White
Write-Host ""
Write-Host "3. Test payment with Stripe test card:" -ForegroundColor White
Write-Host "   Card: 4242 4242 4242 4242" -ForegroundColor Gray
Write-Host "   Expiry: 12/34" -ForegroundColor Gray
Write-Host "   CVC: 123" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Use the client secret from above to complete payment" -ForegroundColor White
Write-Host ""
Write-Host "📚 Full documentation: STRIPE_QUICK_START.md" -ForegroundColor Cyan
Write-Host ""
