# Stripe Integration - Quick Start Guide

## ✅ Your Stripe Integration is Already Implemented!

Everything is ready. You just need to configure your Stripe keys.

---

## Step 1: Get Your Stripe Keys

1. Go to https://dashboard.stripe.com/
2. Sign up or log in
3. Navigate to **Developers** → **API keys**
4. Copy these keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

---

## Step 2: Add Keys to .env File

Open your `.env` file and add:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

---

## Step 3: Run Database Migrations

```bash
cd backend
python manage.py migrate payments
python manage.py migrate accounts
python manage.py migrate compliance
```

---

## Step 4: Set Up Webhook (Development)

### Option A: Using Stripe CLI (Recommended)

1. **Install Stripe CLI:**
   ```bash
   # Windows (using Scoop)
   scoop install stripe
   
   # Or download from:
   # https://github.com/stripe/stripe-cli/releases
   ```

2. **Login to Stripe:**
   ```bash
   stripe login
   ```

3. **Forward webhooks to your local server:**
   ```bash
   stripe listen --forward-to http://localhost:8000/api/payments/webhook/
   ```

4. **Copy the webhook signing secret** (starts with `whsec_`) and add to `.env`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_xxx
   ```

### Option B: Using ngrok (Alternative)

1. Install ngrok: https://ngrok.com/download
2. Start ngrok: `ngrok http 8000`
3. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
4. Go to Stripe Dashboard → Webhooks → Add endpoint
5. Enter: `https://abc123.ngrok.io/api/payments/webhook/`
6. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
7. Copy the signing secret to `.env`

---

## Step 5: Start Your Backend

```bash
cd backend
python manage.py runserver
```

---

## Step 6: Test Payment Flow

### Using the API:

1. **Create a user:**
   ```bash
   POST http://localhost:8000/api/auth/registration/
   
   {
     "email": "test@example.com",
     "username": "testuser",
     "password": "testpass123",
     "password2": "testpass123",
     "name": "Test User",
     "role": "student",
     "track": "DP",
     "privacy_accepted": true,
     "privacy_version": "1.0"
   }
   ```

2. **Login to get token:**
   ```bash
   POST http://localhost:8000/api/auth/login/
   
   {
     "email": "test@example.com",
     "password": "testpass123",
     "role": "student"
   }
   ```

3. **Create payment:**
   ```bash
   POST http://localhost:8000/api/payments/create-payment/
   Authorization: Bearer YOUR_ACCESS_TOKEN
   
   {
     "track": "DP"
   }
   ```
   
   Response:
   ```json
   {
     "clientSecret": "pi_xxx_secret_xxx",
     "paymentIntentId": "pi_xxx",
     "amount": 49900,
     "currency": "usd",
     "publishableKey": "pk_test_xxx"
   }
   ```

4. **Test payment with Stripe test card:**
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/34`)
   - CVC: Any 3 digits (e.g., `123`)
   - ZIP: Any 5 digits (e.g., `12345`)

5. **Webhook fires automatically:**
   - User enrollment status → `ENROLLED`
   - Tools provisioned (Superset, Prefect, Jupyter, Postgres schema)
   - First project unlocked
   - Welcome email sent (TODO)

---

## Test Cards

| Card Number         | Description                    |
|---------------------|--------------------------------|
| 4242 4242 4242 4242 | Successful payment             |
| 4000 0025 0000 3155 | Requires authentication (3DS)  |
| 4000 0000 0000 9995 | Declined (insufficient funds)  |
| 4000 0000 0000 0002 | Declined (generic)             |

---

## API Endpoints Available

### Payment Creation
```bash
POST /api/payments/create-payment/
# Creates PaymentIntent for authenticated user
# Requires: track (DP or FSD)
```

### Checkout Session (Alternative)
```bash
POST /api/payments/create-checkout-session/
# Creates hosted Stripe Checkout page
# Requires: track, success_url, cancel_url
```

### Anonymous Checkout (Payment-First Flow)
```bash
POST /api/payments/create-anonymous-checkout/
# For users who haven't signed up yet
# Requires: email, name, track, success_url, cancel_url
```

### Payment Status
```bash
GET /api/payments/status/{payment_intent_id}/
# Check payment status
```

### Payment History
```bash
GET /api/payments/my-payments/
# List all payments for current user
```

### Request Refund
```bash
POST /api/payments/request-refund/
# Request a refund (admin approval required)
# Requires: payment_intent_id, reason
```

### Webhook (Stripe calls this)
```bash
POST /api/payments/webhook/
# Handles payment_intent.succeeded, payment_failed, charge.refunded
```

---

## What Happens After Payment Success

1. **Webhook receives event** from Stripe
2. **Payment status updated** to `SUCCEEDED`
3. **User enrollment:**
   - `payment_verified = True`
   - `enrollment_status = 'ENROLLED'`
   - `enrolled_at = now()`
4. **Tools provisioned:**
   - **FSD Track:** CodeServer workspace
   - **DP Track:** Postgres schema + Superset + Prefect + Jupyter
5. **First project unlocked:**
   - Creates `StudentProgress` entries
   - Student can start Project 1
6. **Audit log created**
7. **Welcome email sent** (TODO)

---

## Verify It's Working

### Check Payment in Database:
```bash
python manage.py shell

from payments.models import Payment
Payment.objects.all()
```

### Check User Enrollment:
```bash
from django.contrib.auth import get_user_model
User = get_user_model()
user = User.objects.get(email='test@example.com')
print(f"Enrollment: {user.enrollment_status}")
print(f"Payment verified: {user.payment_verified}")
print(f"Tools provisioned: {user.tools_provisioned}")
```

### Check Webhook Logs:
```bash
# In terminal where stripe CLI is running
# You'll see webhook events being forwarded
```

---

## Pricing Configuration

Current pricing (in `backend/payments/stripe_service.py`):

```python
TRACK_PRICES = {
    'DP': 49900,   # $499 for Data Professional
    'FSD': 59900,  # $599 for Full-Stack Developer
}
```

To change prices, edit this dictionary.

---

## Production Setup

When ready for production:

1. **Switch to live keys:**
   ```bash
   STRIPE_SECRET_KEY=sk_live_xxx
   STRIPE_PUBLISHABLE_KEY=pk_live_xxx
   ```

2. **Set up production webhook:**
   - Go to Stripe Dashboard → Webhooks
   - Add endpoint: `https://your-domain.com/api/payments/webhook/`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
   - Copy signing secret to production `.env`

3. **Enable HTTPS** (required for production)

4. **Test with real card** (small amount first)

---

## Troubleshooting

### Webhook not receiving events
- Check Stripe CLI is running
- Verify webhook URL is correct
- Check webhook secret in `.env`
- View logs in Stripe Dashboard

### Payment succeeds but enrollment fails
- Check backend logs for errors
- Verify track exists in database
- Check user permissions
- Verify database migrations ran

### "Invalid API key" error
- Check `.env` file has correct keys
- Restart Django server after changing `.env`
- Verify keys start with `sk_test_` or `pk_test_`

---

## Next Steps

1. ✅ Add Stripe keys to `.env`
2. ✅ Run migrations
3. ✅ Start Stripe webhook forwarding
4. ✅ Test payment flow
5. ✅ Verify user enrollment
6. ✅ Check tools provisioned
7. 🔄 Add email notifications (optional)
8. 🔄 Switch to live keys for production

---

## Support

- Stripe API Docs: https://stripe.com/docs/api
- Stripe Testing: https://stripe.com/docs/testing
- Stripe CLI: https://stripe.com/docs/stripe-cli

---

**Your Stripe integration is complete and ready to use!** 🎉

Just add your API keys and start testing.
