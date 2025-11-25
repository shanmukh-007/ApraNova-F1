#!/bin/bash

# ApraNova Stripe Integration Setup Script
# This script helps you set up Stripe integration for development

echo "========================================="
echo "ApraNova Stripe Integration Setup"
echo "========================================="
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo "✅ .env file created"
fi

echo ""
echo "📝 Please provide your Stripe credentials:"
echo ""

# Get Stripe keys
read -p "Enter your Stripe Publishable Key (pk_test_...): " STRIPE_PK
read -p "Enter your Stripe Secret Key (sk_test_...): " STRIPE_SK

# Update .env file
if grep -q "STRIPE_PUBLISHABLE_KEY=" .env; then
    sed -i "s|STRIPE_PUBLISHABLE_KEY=.*|STRIPE_PUBLISHABLE_KEY=$STRIPE_PK|" .env
else
    echo "STRIPE_PUBLISHABLE_KEY=$STRIPE_PK" >> .env
fi

if grep -q "STRIPE_SECRET_KEY=" .env; then
    sed -i "s|STRIPE_SECRET_KEY=.*|STRIPE_SECRET_KEY=$STRIPE_SK|" .env
else
    echo "STRIPE_SECRET_KEY=$STRIPE_SK" >> .env
fi

echo ""
echo "✅ Stripe keys added to .env"
echo ""

# Check if Stripe CLI is installed
if command -v stripe &> /dev/null; then
    echo "✅ Stripe CLI is installed"
    echo ""
    echo "🔧 Setting up webhook forwarding..."
    echo ""
    echo "Run this command in a separate terminal:"
    echo ""
    echo "  stripe listen --forward-to http://localhost:8000/api/payments/webhook/"
    echo ""
    echo "Then copy the webhook signing secret (whsec_...) and add it to .env:"
    echo "  STRIPE_WEBHOOK_SECRET=whsec_..."
    echo ""
else
    echo "⚠️  Stripe CLI not found"
    echo ""
    echo "To install Stripe CLI:"
    echo ""
    echo "  macOS:   brew install stripe/stripe-cli/stripe"
    echo "  Windows: scoop install stripe"
    echo "  Linux:   See https://stripe.com/docs/stripe-cli"
    echo ""
fi

echo ""
echo "📦 Running database migrations..."
cd backend
python manage.py migrate payments
cd ..

echo ""
echo "========================================="
echo "✅ Stripe Integration Setup Complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Start the backend server:"
echo "   cd backend && python manage.py runserver"
echo ""
echo "2. In another terminal, start Stripe webhook forwarding:"
echo "   stripe listen --forward-to http://localhost:8000/api/payments/webhook/"
echo ""
echo "3. Copy the webhook secret and add to .env:"
echo "   STRIPE_WEBHOOK_SECRET=whsec_..."
echo ""
echo "4. Test with a payment using card: 4242 4242 4242 4242"
echo ""
echo "📚 Full documentation: STRIPE_INTEGRATION_COMPLETE.md"
echo ""
