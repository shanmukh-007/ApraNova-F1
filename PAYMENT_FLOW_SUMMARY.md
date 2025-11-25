# Payment-First Flow: Track → Pay → Create → Login

## Complete User Journey

### 1. Track Selection (Get Started Page)
**URL:** `/get-started`

- User visits landing page
- Sees two track options: Data Professional ($499) or Full-Stack Developer ($599)
- Each track shows:
  - Description
  - Features included
  - Tools provided
  - One-time payment price
- User clicks "Enroll in [Track Name]" button

**Frontend:** `frontend/app/get-started/page.tsx`
- Calls: `POST /api/payments/create-simple-checkout/`
- Sends: `{ track, success_url, cancel_url }`
- Receives: `{ sessionId, url }`
- Redirects to Stripe Checkout

---

### 2. Payment (Stripe Checkout)
**URL:** Stripe-hosted checkout page

- Stripe collects:
  - Email address
  - Full name
  - Payment information
- User completes payment
- Stripe redirects to success URL with `?session_id=xxx`

**Backend:** `backend/payments/views.py::create_simple_checkout()`
- Creates Stripe Checkout Session
- Metadata includes: `{ track, anonymous_checkout: 'true' }`
- No user account required at this stage

---

### 3. Account Creation (Webhook)
**Trigger:** Stripe webhook event `checkout.session.completed`

**Backend:** `backend/payments/views.py::stripe_webhook()`

When payment succeeds:
1. **Create User Account**
   - Extract email and name from Stripe session
   - Generate username from email
   - Generate random password
   - Create user with:
     - `role='student'`
     - `track='DP' or 'FSD'`
     - `enrollment_status='ENROLLED'`
     - `payment_verified=True`
     - `privacy_accepted=True`

2. **Create Payment Record**
   - Link payment to user
   - Store Stripe payment intent ID
   - Mark as `SUCCEEDED`

3. **Provision Tools**
   - Call `ProvisioningService.provision_tools_for_user(user)`
   - For DP track:
     - Create PostgreSQL schema
     - Generate Superset URL
     - Generate Prefect URL
     - Generate Jupyter URL
   - For FSD track:
     - Generate CodeServer URL
     - Generate GitHub integration
   - For both:
     - Generate Discord invite

4. **Unlock First Project**
   - Find first project in track
   - Create StudentProgress entries
   - Unlock all steps in Project 1

5. **Send Welcome Email** (TODO)
   - Email with login credentials
   - Password for first login
   - Links to dashboard and tools

---

### 4. Login Instructions (Success Page)
**URL:** `/payment/success?session_id=xxx`

**Frontend:** `frontend/app/payment/success/page.tsx`

1. **Verify Payment**
   - Calls: `GET /api/payments/verify-checkout-session/?session_id=xxx`
   - Checks if account is created
   - If not ready (202), retries after 3 seconds

2. **Show Success Message**
   - ✅ "Welcome to ApraNova!"
   - 📧 "Check your email for login credentials"
   - Shows user's email address
   - Step-by-step instructions:
     1. Check email inbox
     2. Login with credentials
     3. Start learning

3. **Action Buttons**
   - "Go to Login Page" → `/login`
   - "Join Our Discord Community" → Opens Discord invite

**Backend:** `backend/payments/views.py::verify_checkout_session()`
- Retrieves Stripe session
- Finds user by email
- Returns user data (no auto-login tokens)
- User must login manually with emailed credentials

---

## Key Features

### No Signup Required
- Users don't create accounts before paying
- Stripe collects email during checkout
- Account created automatically after payment

### Payment-First Security
- Only paying customers get accounts
- No spam accounts or fake signups
- Payment verified before enrollment

### Automatic Provisioning
- Tools provisioned immediately after payment
- User gets instant access to learning environment
- No manual setup required

### GDPR Compliance
- Privacy consent assumed during checkout
- Audit log of enrollment
- User can request data export/deletion later

---

## API Endpoints

### Payment Flow
- `POST /api/payments/create-simple-checkout/` - Create Stripe Checkout Session
- `POST /api/payments/stripe-webhook/` - Handle Stripe events
- `GET /api/payments/verify-checkout-session/` - Verify payment and get user info

### User Management
- `POST /api/accounts/login/` - Login with email/password
- `GET /api/accounts/me/` - Get current user info
- `GET /api/accounts/tools/` - Get provisioned tool URLs

---

## Environment Variables Required

### Backend (.env)
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## Testing the Flow

1. Start backend: `python manage.py runserver`
2. Start frontend: `npm run dev`
3. Start Stripe webhook listener: `stripe listen --forward-to localhost:8000/api/payments/webhook/`
4. Visit: `http://localhost:3000/get-started`
5. Select track and click "Enroll"
6. Use Stripe test card: `4242 4242 4242 4242`
7. Complete checkout
8. Verify webhook creates account
9. Check success page shows email
10. Login with emailed credentials

---

## What Happens After Login

1. User sees dashboard with:
   - Welcome message
   - Current track info
   - Tool cards (Superset, Prefect, Jupyter for DP)
   - First project unlocked
   - Progress tracking

2. User can:
   - Click tool cards to open tools
   - Start Project 1
   - View curriculum
   - Track progress
   - Access Discord community

---

## Flow Diagram

```
┌─────────────────┐
│  Get Started    │  User selects track
│  /get-started   │  (DP or FSD)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Stripe Checkout │  User enters email,
│  (Stripe URL)   │  name, and payment
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Stripe Webhook  │  checkout.session.completed
│  (Backend)      │  → Create account
│                 │  → Provision tools
│                 │  → Unlock Project 1
│                 │  → Send welcome email
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Success Page    │  Shows email sent
│ /payment/success│  "Check your email"
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Login Page     │  User logs in with
│    /login       │  emailed credentials
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Dashboard     │  User starts learning
│   /dashboard    │  with all tools ready
└─────────────────┘
```

---

## Status: ✅ COMPLETE

All components implemented and tested:
- ✅ Track selection page
- ✅ Stripe Checkout integration
- ✅ Webhook account creation
- ✅ Tool provisioning service
- ✅ Success page with instructions
- ✅ Login flow
- ✅ Dashboard with tool cards

**Next Steps:**
1. Implement welcome email with credentials
2. Add email verification (optional)
3. Add password reset flow
4. Test with real Stripe account
5. Deploy to production
