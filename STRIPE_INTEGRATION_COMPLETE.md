# Complete Stripe Integration Guide for ApraNova LMS

## Overview

This guide covers the complete Stripe payment integration for ApraNova LMS, including setup, testing, and production deployment.

## Features Implemented

### ✅ Payment Processing
- **PaymentIntent API**: Secure payment processing with SCA compliance
- **Checkout Sessions**: Alternative hosted checkout page
- **Customer Management**: Automatic Stripe customer creation
- **Payment Methods**: Support for cards and other payment methods

### ✅ Enrollment Automation
- Automatic enrollment after successful payment
- Track assignment (DP or FSD)
- First project unlocking
- Student progress initialization

### ✅ Refund Management
- Full and partial refunds
- Refund tracking in database
- Enrollment status updates on refund

### ✅ Webhook Handling
- `payment_intent.succeeded` - Enroll student
- `payment_intent.payment_failed` - Log failure
- `charge.refunded` - Update enrollment status
- `checkout.session.completed` - Handle checkout completion

### ✅ Security & Compliance
- Webhook signature verification
- Secure credential storage
- Audit logging for all payment events
- GDPR-compliant data retention (7 years for payment records)

## Architecture

```
┌─────────────┐
│   Frontend  │
│  (Next.js)  │
└──────┬──────┘
       │
       │ 1. Create Payment
       ▼
┌─────────────────────────────────┐
│   Backend API (Django)          │
│                                 │
│  ┌──────────────────────────┐  │
│  │  StripeService           │  │
│  │  - create_payment_intent │  │
│  │  - create_customer       │  │
│  │  - create_refund         │  │
│  └──────────────────────────┘  │
│                                 │
│  ┌──────────────────────────┐  │
│  │  Payment Model           │  │
│  │  - track payment records │  │
│  │  - refund tracking       │  │
│  └──────────────────────────┘  │
└────────┬────────────────────────┘
         │
         │ 2. Process Payment
         ▼
┌─────────────────────────────────┐
│         Stripe API              │
│  - Payment processing           │
│  - Customer management          │
│  - Webhook events               │
└────────┬────────────────────────┘
         │
         │ 3. Webhook: payment_intent.succeeded
         ▼
┌─────────────────────────────────┐
│   Backend Webhook Handler       │
│  - Verify signature             │
│  - Update payment status        │
│  - Enroll student               │
│  - Unlock first project         │
│  - Send welcome email           │
└─────────────────────────────────┘
```

## Setup Instructions

### 1. Get Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Developers** → **API keys**
3. Copy your keys:
   - **Publishable key** (starts with `pk_test_` or `pk_live_`)
   - **Secret key** (starts with `sk_test_` or `sk_live_`)

### 2. Configure Environment Variables

Add to your `.env` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 3. Set Up Webhook Endpoint

#### Development (using Stripe CLI)

1. Install Stripe CLI:
   ```bash
   # Windows (using Scoop)
   scoop install stripe
   
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Linux
   wget https://github.com/stripe/stripe-cli/releases/download/v1.19.0/stripe_1.19.0_linux_x86_64.tar.gz
   tar -xvf stripe_1.19.0_linux_x86_64.tar.gz
   ```

2. Login to Stripe:
   ```bash
   stripe login
   ```

3. Forward webhooks to local server:
   ```bash
   stripe listen --forward-to http://localhost:8000/api/payments/webhook/
   ```

4. Copy the webhook signing secret (starts with `whsec_`) and add to `.env`

#### Production

1. Go to **Stripe Dashboard** → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter your webhook URL: `https://your-domain.com/api/payments/webhook/`
4. Select events to listen to:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
   - `checkout.session.completed`
5. Copy the **Signing secret** and add to production environment variables

### 4. Run Database Migrations

```bash
cd backend
python manage.py makemigrations payments
python manage.py migrate payments
```

### 5. Test the Integration

```bash
# Start backend
python manage.py runserver

# In another terminal, start Stripe webhook forwarding
stripe listen --forward-to http://localhost:8000/api/payments/webhook/
```

## API Endpoints

### 1. Create Payment Intent

**Endpoint:** `POST /api/payments/create-payment/`

**Authentication:** Required

**Request Body:**
```json
{
  "track": "DP",  // or "FSD"
  "amount": 49900,  // Optional, in cents (defaults to track price)
  "currency": "usd"  // Optional
}
```

**Response:**
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx",
  "amount": 49900,
  "currency": "usd",
  "publishableKey": "pk_test_xxx"
}
```

### 2. Create Checkout Session

**Endpoint:** `POST /api/payments/create-checkout-session/`

**Authentication:** Required

**Request Body:**
```json
{
  "track": "FSD",
  "success_url": "https://your-domain.com/payment/success",
  "cancel_url": "https://your-domain.com/payment/cancel"
}
```

**Response:**
```json
{
  "sessionId": "cs_test_xxx",
  "url": "https://checkout.stripe.com/c/pay/cs_test_xxx"
}
```

### 3. Get Payment Status

**Endpoint:** `GET /api/payments/status/{payment_intent_id}/`

**Authentication:** Required

**Response:**
```json
{
  "payment_id": 123,
  "status": "SUCCEEDED",
  "amount": 499.00,
  "currency": "usd",
  "track": "DP",
  "created_at": "2024-01-15T10:30:00Z",
  "stripe_status": "succeeded"
}
```

### 4. Get User Payments

**Endpoint:** `GET /api/payments/my-payments/`

**Authentication:** Required

**Response:**
```json
{
  "payments": [
    {
      "id": 123,
      "payment_intent_id": "pi_xxx",
      "amount": 499.00,
      "currency": "usd",
      "status": "SUCCEEDED",
      "track": "DP",
      "refunded": false,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### 5. Request Refund

**Endpoint:** `POST /api/payments/request-refund/`

**Authentication:** Required

**Request Body:**
```json
{
  "payment_intent_id": "pi_xxx",
  "reason": "Student requested withdrawal"
}
```

**Response:**
```json
{
  "message": "Refund request submitted. An admin will review your request.",
  "payment_id": 123,
  "reason": "Student requested withdrawal"
}
```

## Frontend Integration

### Using PaymentIntent (Recommended)

```typescript
// 1. Create payment intent
const response = await fetch('/api/payments/create-payment/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    track: 'DP'  // or 'FSD'
  })
});

const { clientSecret, publishableKey } = await response.json();

// 2. Initialize Stripe
const stripe = await loadStripe(publishableKey);
const elements = stripe.elements({ clientSecret });

// 3. Create payment element
const paymentElement = elements.create('payment');
paymentElement.mount('#payment-element');

// 4. Handle form submission
const { error } = await stripe.confirmPayment({
  elements,
  confirmParams: {
    return_url: 'https://your-domain.com/payment/success',
  },
});

if (error) {
  // Show error to customer
  console.error(error.message);
}
```

### Using Checkout Session (Simpler)

```typescript
// 1. Create checkout session
const response = await fetch('/api/payments/create-checkout-session/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    track: 'FSD',
    success_url: window.location.origin + '/payment/success',
    cancel_url: window.location.origin + '/payment/cancel'
  })
});

const { url } = await response.json();

// 2. Redirect to Stripe Checkout
window.location.href = url;
```

## Testing

### Test Card Numbers

Use these test cards in development:

| Card Number         | Description                    |
|---------------------|--------------------------------|
| 4242 4242 4242 4242 | Successful payment             |
| 4000 0025 0000 3155 | Requires authentication (3DS)  |
| 4000 0000 0000 9995 | Declined (insufficient funds)  |
| 4000 0000 0000 0002 | Declined (generic)             |

**Expiry:** Any future date (e.g., 12/34)  
**CVC:** Any 3 digits (e.g., 123)  
**ZIP:** Any 5 digits (e.g., 12345)

### Testing Webhooks

```bash
# Trigger a test payment_intent.succeeded event
stripe trigger payment_intent.succeeded

# Trigger a test payment_intent.payment_failed event
stripe trigger payment_intent.payment_failed

# Trigger a test charge.refunded event
stripe trigger charge.refunded
```

### Manual Testing Flow

1. **Create account** on frontend
2. **Select track** (DP or FSD)
3. **Initiate payment** - calls `/api/payments/create-payment/`
4. **Enter test card** - 4242 4242 4242 4242
5. **Complete payment** - Stripe processes payment
6. **Webhook fires** - `payment_intent.succeeded`
7. **Backend enrolls student** - Updates user, unlocks Project 1
8. **Redirect to dashboard** - Student sees first project

## Pricing Configuration

Current pricing (defined in `stripe_service.py`):

```python
TRACK_PRICES = {
    'DP': 49900,   # $499 for Data Professional
    'FSD': 59900,  # $599 for Full-Stack Developer
}
```

To change prices, update the `TRACK_PRICES` dictionary in `backend/payments/stripe_service.py`.

## Webhook Events Flow

### payment_intent.succeeded

```
1. Webhook received
2. Verify signature
3. Find payment record
4. Update payment status to 'SUCCEEDED'
5. Update user:
   - payment_verified = True
   - enrollment_status = 'ENROLLED'
   - enrolled_at = now()
   - track = metadata.track
6. Unlock first project:
   - Create StudentProgress for Project 1
   - Create StudentProgress for all steps
7. Log audit event
8. Send welcome email (TODO)
9. Notify admin (TODO)
```

### charge.refunded

```
1. Webhook received
2. Verify signature
3. Find payment record
4. Update payment:
   - refunded = True
   - refund_amount = amount
   - refunded_at = now()
   - status = 'REFUNDED'
5. Update user:
   - enrollment_status = 'WITHDRAWN'
6. Log audit event
```

## Security Best Practices

### ✅ Implemented

1. **Webhook signature verification** - Prevents fake webhooks
2. **HTTPS only in production** - Encrypted data transmission
3. **Secure credential storage** - Environment variables, not in code
4. **Audit logging** - All payment events logged
5. **No card data storage** - Stripe handles all sensitive data
6. **Customer ID reuse** - One Stripe customer per user

### 🔄 Recommended

1. **Rate limiting** - Prevent abuse of payment endpoints
2. **IP whitelisting** - Restrict webhook endpoint to Stripe IPs
3. **Fraud detection** - Use Stripe Radar
4. **3D Secure** - Already enabled via `automatic_payment_methods`

## Troubleshooting

### Webhook not receiving events

1. Check webhook URL is correct
2. Verify webhook secret in `.env`
3. Check Stripe CLI is running (development)
4. Check webhook endpoint is publicly accessible (production)
5. View webhook logs in Stripe Dashboard

### Payment succeeds but enrollment fails

1. Check backend logs for errors
2. Verify track exists in database
3. Verify first project exists for track
4. Check user permissions

### Refund not processing

1. Verify payment was successful
2. Check payment is not already refunded
3. Verify Stripe secret key has refund permissions
4. Check Stripe Dashboard for refund status

## Production Checklist

- [ ] Switch to live Stripe keys (`pk_live_` and `sk_live_`)
- [ ] Set up production webhook endpoint
- [ ] Configure webhook secret in production environment
- [ ] Enable HTTPS on backend
- [ ] Set up email notifications (welcome, failure)
- [ ] Configure Slack notifications for admins
- [ ] Test full payment flow in production
- [ ] Set up monitoring and alerts
- [ ] Review Stripe Dashboard settings
- [ ] Enable Stripe Radar for fraud detection
- [ ] Set up automatic payout schedule
- [ ] Configure tax settings if applicable

## Monitoring

### Key Metrics to Track

1. **Payment success rate** - Target: >95%
2. **Average payment time** - Target: <30 seconds
3. **Refund rate** - Target: <5%
4. **Webhook delivery success** - Target: 100%
5. **Failed payment reasons** - Monitor and address

### Stripe Dashboard

Monitor these sections:
- **Payments** - View all transactions
- **Customers** - View customer records
- **Webhooks** - Check webhook delivery
- **Radar** - Review fraud alerts
- **Reports** - Financial reports

## Support

### For Developers

- Stripe API Docs: https://stripe.com/docs/api
- Stripe CLI Docs: https://stripe.com/docs/stripe-cli
- Webhook Testing: https://stripe.com/docs/webhooks/test

### For Issues

1. Check backend logs
2. Check Stripe Dashboard webhook logs
3. Review audit logs in database
4. Contact Stripe support if needed

## Next Steps

### Phase 2 Enhancements

1. **Email notifications**
   - Welcome email after payment
   - Payment failure notification
   - Refund confirmation

2. **Admin dashboard**
   - View all payments
   - Process refunds
   - View payment analytics

3. **Subscription model** (optional)
   - Monthly payment plans
   - Installment options
   - Subscription management

4. **Coupon codes**
   - Discount codes
   - Promotional pricing
   - Referral discounts

5. **Multiple payment methods**
   - Bank transfers
   - Digital wallets (Apple Pay, Google Pay)
   - Buy now, pay later (Klarna, Afterpay)
