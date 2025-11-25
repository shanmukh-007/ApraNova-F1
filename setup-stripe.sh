#!/bin/bash

# Stripe Integration Setup Script for Linux/Mac
# Run this script to install Stripe dependencies

echo "========================================"
echo "  Stripe Payment Integration Setup"
echo "========================================"
echo ""

# Check if Node.js is installed
echo "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org"
    exit 1
fi
NODE_VERSION=$(node --version)
echo "✅ Node.js version: $NODE_VERSION"
echo ""

# Navigate to frontend directory
echo "Navigating to frontend directory..."
if [ ! -d "frontend" ]; then
    echo "❌ Frontend directory not found!"
    exit 1
fi
cd frontend

# Install Stripe dependencies
echo "Installing Stripe dependencies..."
echo "Running: npm install @stripe/stripe-js @stripe/react-stripe-js"
npm install @stripe/stripe-js @stripe/react-stripe-js

if [ $? -ne 0 ]; then
    echo "❌ Failed to install Stripe dependencies!"
    cd ..
    exit 1
fi

echo "✅ Stripe dependencies installed successfully!"
echo ""

# Return to root directory
cd ..

# Check if .env file exists
echo "Checking environment configuration..."
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found!"
    echo "Creating .env file from template..."
    
    if [ -f ".env.example" ]; then
        cp ".env.example" ".env"
        echo "✅ .env file created from .env.example"
    else
        echo "❌ .env.example not found!"
    fi
fi

# Check for Stripe keys in .env
echo ""
echo "Checking Stripe configuration..."
if grep -q "STRIPE_SECRET_KEY=sk_" ".env"; then
    echo "✅ STRIPE_SECRET_KEY found in .env"
else
    echo "⚠️  STRIPE_SECRET_KEY not configured in .env"
    echo "   Please add your Stripe secret key to .env file"
fi

if grep -q "STRIPE_PUBLISHABLE_KEY=pk_" ".env"; then
    echo "✅ STRIPE_PUBLISHABLE_KEY found in .env"
else
    echo "⚠️  STRIPE_PUBLISHABLE_KEY not configured in .env"
    echo "   Please add your Stripe publishable key to .env file"
fi

echo ""
echo "========================================"
echo "  Setup Complete!"
echo "========================================"
echo ""
echo "Next Steps:"
echo "1. Get your Stripe API keys from: https://dashboard.stripe.com/test/apikeys"
echo "2. Add them to your .env file:"
echo "   STRIPE_SECRET_KEY=sk_test_..."
echo "   STRIPE_PUBLISHABLE_KEY=pk_test_..."
echo "3. Start your services:"
echo "   Backend:  docker-compose up"
echo "   Frontend: cd frontend && npm run dev"
echo "4. Test payment flow at: http://localhost:3000"
echo ""
echo "📚 For detailed instructions, see: STRIPE_INTEGRATION_GUIDE.md"
echo ""
