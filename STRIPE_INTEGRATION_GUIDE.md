# Stripe Payment Integration Guide

## 🎉 Overview

Stripe payment has been successfully integrated into the ApraNova LMS signup flow. Students now need to complete payment after selecting their track and before accessing the platform.

## 📋 Payment Flow

```
1. Student visits homepage
   ↓
2. Clicks "Get Started"
   ↓
3. Selects Track (DP or FSD)
   ↓
4. **NEW: Redirected to Payment Page**
   ↓
5. Enters payment details (Stripe)
   ↓
6. Payment processed
   ↓
7. Redirected to Success Page
   ↓
8. Can now Sign Up / Login
   ↓
9. Access Dashboard & Workspace
```

## 🚀 Setup Instructions

### 1. Install Frontend Dependencies

```bash
cd frontend
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### 2. Configure Environment Variables

#### Backend (.env)
```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

#### Frontend (.env.local)
```env
# No Stripe keys needed in frontend - they're fetched from backend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Get Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Create an account or login
3. Navigate to **Developers → API Keys**
4. Copy your **Publishable key** and **Secret key**
5. For testing, use **Test mode** keys (they start with `pk_test_` and `sk_test_`)

### 4. Test the Integration

#### Test Cards

| Card Number | Description |
|-------------|-------------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 9995` | Declined payment |
| `4000 0025 0000 3155` | Requires authentication (3D Secure) |

**Test Details:**
- **Expiry**: Any future date (e.g., 12/34)
- **CVC**: Any 3 digits (e.g., 123)
- **ZIP**: Any 5 digits (e.g., 12345)

## 📁 New Files Created

### Frontend

1. **`frontend/app/payment/page.tsx`**
   - Main payment page
   - Shows order summary and payment form
   - Initializes Stripe Elements

2. **`frontend/components/payment/payment-form.tsx`**
   - Stripe payment form component
   - Handles payment submission
   - Shows success/error messages

3. **`frontend/app/payment/success/page.tsx`**
   - Payment success confirmation page
   - Shows next steps
   - Redirects to dashboard

### Backend

**Updated `backend/payments/views.py`:**
- `create_payment()` - Creates Stripe Payment Intent
- `confirm_enrollment()` - Confirms enrollment after payment
- `stripe_webhook()` - Handles Stripe webhook events

**Updated `backend/payments/urls.py`:**
- Added new endpoints for payment confirmation and webhooks

## 💰 Pricing Configuration

Current pricing is set in `frontend/app/payment/page.tsx`:

```typescript
const TRACK_PRICING = {
  DP: {
    name: "Data Professional",
    price: 999,  // $999 USD
    currency: "usd",
  },
  FSD: {
    name: "Full Stack Development",
    price: 999,  // $999 USD
    currency: "usd",
  }
}
```

**To change pricing:**
1. Edit the `TRACK_PRICING` object
2. Update the `price` value (in dollars)
3. Change `currency` if needed (usd, inr, eur, etc.)

## 🔄 Payment States

| Status | Description | User Action |
|--------|-------------|-------------|
| **Pending** | Payment intent created | Enter card details |
| **Processing** | Payment being processed | Wait |
| **Succeeded** | Payment completed | Access granted |
| **Failed** | Payment declined | Try again |
| **Canceled** | User canceled | Try again |

## 🔐 Security Features

✅ **PCI Compliance**: Card details never touch our servers  
✅ **Stripe.js**: Client-side tokenization  
✅ **HTTPS Only**: All communication encrypted  
✅ **Webhook Verification**: Signed webhook events  
✅ **JWT Authentication**: Secure API access  

## 🧪 Testing Workflow

### 1. Start Services

```bash
# Terminal 1: Backend
cd backend
docker-compose up

# Terminal 2: Frontend
cd frontend
npm run dev
```

### 2. Test Payment Flow

1. Go to http://localhost:3000
2. Click "Get Started"
3. Select a track (DP or FSD)
4. Click "Continue to Payment"
5. Enter test card: `4242 4242 4242 4242`
6. Enter any future expiry, CVC, and ZIP
7. Click "Pay $999"
8. Should see success page
9. Redirected to dashboard

### 3. Verify in Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/payments)
2. You should see the test payment
3. Check payment status and details

## 🔔 Webhook Setup (Production)

### 1. Create Webhook Endpoint

1. Go to **Stripe Dashboard → Developers → Webhooks**
2. Click **Add endpoint**
3. Enter URL: `https://yourdomain.com/api/payments/webhook/`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
5. Copy the **Signing secret**
6. Add to `.env`: `STRIPE_WEBHOOK_SECRET=whsec_...`

### 2. Test Webhook Locally

```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:8000/api/payments/webhook/

# Trigger test event
stripe trigger payment_intent.succeeded
```

## 📊 Database Schema

### Payment Model

```python
class Payment(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    stripe_payment_intent = models.CharField(max_length=255, unique=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default="usd")
    status = models.CharField(max_length=50, default="created")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### Query Payments

```python
# Get all successful payments
Payment.objects.filter(status='succeeded')

# Get user's payments
Payment.objects.filter(user=user)

# Get total revenue
from django.db.models import Sum
Payment.objects.filter(status='succeeded').aggregate(Sum('amount'))
```

## 🎨 Customization

### Change Payment Page Theme

Edit `frontend/app/payment/page.tsx`:

```typescript
<Elements
  stripe={stripePromise}
  options={{
    clientSecret,
    appearance: {
      theme: "stripe",  // or "night", "flat"
      variables: {
        colorPrimary: "#0070f3",  // Your brand color
        colorBackground: "#ffffff",
        colorText: "#000000",
      },
    },
  }}
>
```

### Add Discount Codes

1. Create discount model in backend
2. Add discount field to payment form
3. Validate discount code in `create_payment()` view
4. Apply discount to amount before creating Payment Intent

### Add Multiple Payment Methods

Stripe automatically shows available payment methods based on:
- Currency
- Customer location
- Payment method configuration in Stripe Dashboard

To enable more methods:
1. Go to **Stripe Dashboard → Settings → Payment methods**
2. Enable desired methods (Apple Pay, Google Pay, etc.)
3. They'll automatically appear in the payment form

## 🐛 Troubleshooting

### Payment Form Not Loading

**Issue**: Blank payment page or loading forever

**Solutions**:
1. Check browser console for errors
2. Verify Stripe keys in `.env`
3. Ensure backend is running
4. Check API endpoint: `http://localhost:8000/api/payments/create-payment/`

### "Invalid API Key" Error

**Issue**: Stripe returns invalid API key error

**Solutions**:
1. Verify `STRIPE_SECRET_KEY` in backend `.env`
2. Make sure you're using the correct key (test vs live)
3. Check for extra spaces or quotes in `.env` file
4. Restart backend after changing `.env`

### Payment Succeeds but User Not Enrolled

**Issue**: Payment goes through but user can't access content

**Solutions**:
1. Check `confirm_enrollment()` endpoint is being called
2. Verify user's track is being updated
3. Check database: `Payment.objects.filter(user=user)`
4. Look at backend logs for errors

### Webhook Not Receiving Events

**Issue**: Webhook endpoint not being called

**Solutions**:
1. Verify webhook URL in Stripe Dashboard
2. Check webhook signing secret in `.env`
3. Ensure endpoint is publicly accessible (use ngrok for local testing)
4. Check Stripe Dashboard → Webhooks → Logs for delivery attempts

## 📚 Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Stripe Elements](https://stripe.com/docs/stripe-js)
- [Payment Intents API](https://stripe.com/docs/payments/payment-intents)
- [Webhooks Guide](https://stripe.com/docs/webhooks)

## 🎯 Next Steps

1. ✅ Install Stripe dependencies
2. ✅ Configure API keys
3. ✅ Test payment flow
4. ⬜ Set up production webhook
5. ⬜ Configure live API keys
6. ⬜ Add email notifications
7. ⬜ Implement refund functionality
8. ⬜ Add payment history page

## 💡 Pro Tips

1. **Always use test mode** during development
2. **Never commit API keys** to version control
3. **Test all payment scenarios** (success, failure, cancellation)
4. **Monitor Stripe Dashboard** for payment issues
5. **Set up email notifications** for failed payments
6. **Implement retry logic** for failed webhook deliveries
7. **Add analytics** to track conversion rates

---

**Last Updated**: November 20, 2025  
**Status**: ✅ Complete and Ready for Testing

