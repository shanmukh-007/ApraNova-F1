# Payment Integration Troubleshooting

## ✅ Issue Fixed: "Failed to initialize payment"

### Problem
The payment page was requiring authentication, but users aren't logged in yet when they try to pay.

### Solution
Changed the payment flow to:
1. **Payment First** - Users pay without needing to log in
2. **Collect Email** - Email is collected during payment
3. **Then Signup** - After successful payment, users create their account

### New Flow

```
1. Select Track → 2. Enter Email & Pay → 3. Payment Success → 4. Create Account
```

## 🔧 Changes Made

### Backend (`backend/payments/views.py`)
- Changed `create_payment()` from `@permission_classes([IsAuthenticated])` to `@permission_classes([AllowAny])`
- Added email parameter to payment creation
- Payment now works without authentication

### Frontend (`frontend/app/payment/page.tsx`)
- Removed authentication requirement from API call
- Added email collection from sessionStorage

### Payment Form (`frontend/components/payment/payment-form.tsx`)
- Added email input field
- Stores payment info in sessionStorage
- Redirects to signup after successful payment

### Success Page (`frontend/app/payment/success/page.tsx`)
- Changed button from "Go to Dashboard" to "Create Your Account"
- Redirects to signup page with track pre-selected

## 🧪 Testing the Fix

### 1. Test Payment Flow

```bash
# Start services
docker-compose up
cd frontend && npm run dev
```

### 2. Navigate Through Flow

1. Go to http://localhost:3000
2. Click "Get Started"
3. Select a track (DP or FSD)
4. **Payment page should load now** ✅
5. Enter email: `test@example.com`
6. Enter test card: `4242 4242 4242 4242`
7. Expiry: `12/34`, CVC: `123`, ZIP: `12345`
8. Click "Pay $999"
9. Should see success page
10. Click "Create Your Account"
11. Should redirect to signup with email pre-filled

### 3. Verify

- [ ] Payment page loads without errors
- [ ] Can enter email and card details
- [ ] Payment processes successfully
- [ ] Success page appears
- [ ] Redirects to signup
- [ ] Email is pre-filled in signup form

## 🐛 Common Issues & Solutions

### Issue: "Failed to initialize payment"

**Cause**: Missing Stripe keys or backend not running

**Solution**:
```bash
# Check .env file has Stripe keys
grep STRIPE .env

# Should see:
# STRIPE_SECRET_KEY=sk_test_...
# STRIPE_PUBLISHABLE_KEY=pk_test_...

# Restart backend
docker-compose restart backend
```

### Issue: Payment form is blank

**Cause**: Stripe keys not configured

**Solution**:
1. Get keys from https://dashboard.stripe.com/test/apikeys
2. Add to `.env`:
   ```env
   STRIPE_SECRET_KEY=sk_test_your_key_here
   STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
   ```
3. Restart backend: `docker-compose restart backend`

### Issue: "Invalid API Key" error

**Cause**: Wrong key format or missing key

**Solution**:
- Test keys start with `sk_test_` and `pk_test_`
- Live keys start with `sk_live_` and `pk_live_`
- Make sure no extra spaces or quotes in `.env`

### Issue: Payment succeeds but can't create account

**Cause**: Email not stored in sessionStorage

**Solution**:
- Check browser console for errors
- Verify email is entered before payment
- Check sessionStorage: `sessionStorage.getItem('userEmail')`

### Issue: CORS error

**Cause**: Backend CORS not configured for payment endpoint

**Solution**:
Already fixed - payment endpoint allows all origins for unauthenticated requests

## 📋 Verification Checklist

After fixing, verify these work:

- [ ] Can access payment page without login
- [ ] Email field appears in payment form
- [ ] Can enter card details
- [ ] Payment processes successfully
- [ ] Success page shows correct track
- [ ] "Create Your Account" button works
- [ ] Redirects to signup page
- [ ] Email is pre-filled in signup
- [ ] Track is pre-selected in signup
- [ ] Can complete signup after payment

## 🔍 Debug Commands

### Check Backend Logs
```bash
docker logs apranova_backend -f | grep payment
```

### Check Frontend Console
Open browser DevTools (F12) → Console tab

### Test API Endpoint
```bash
curl -X POST http://localhost:8000/api/payments/create-payment/ \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 999,
    "currency": "usd",
    "email": "test@example.com",
    "metadata": {"track": "DP"}
  }'
```

Should return:
```json
{
  "clientSecret": "pi_..._secret_...",
  "publishableKey": "pk_test_..."
}
```

## 🎯 Expected Behavior

### Before Fix
```
Select Track → Payment Page → ❌ Error: "Failed to initialize payment"
```

### After Fix
```
Select Track → Payment Page → Enter Email → Pay → Success → Signup
```

## 💡 Pro Tips

1. **Always test with test cards** - Never use real cards in development
2. **Check browser console** - Most errors show up there first
3. **Verify Stripe keys** - Wrong keys are the #1 cause of issues
4. **Clear sessionStorage** - If testing multiple times: `sessionStorage.clear()`
5. **Check backend logs** - Use `docker logs apranova_backend -f`

## 📞 Still Having Issues?

1. Check all Stripe keys are correct
2. Verify backend is running: `docker ps`
3. Check frontend is running: `http://localhost:3000`
4. Clear browser cache and sessionStorage
5. Try in incognito/private window
6. Check Stripe Dashboard for payment attempts

## ✅ Success Indicators

You'll know it's working when:
- ✅ Payment page loads without errors
- ✅ Email field is visible
- ✅ Can enter card details
- ✅ Payment processes (check Stripe Dashboard)
- ✅ Success page appears
- ✅ Can create account after payment

---

**Last Updated**: November 20, 2025  
**Status**: ✅ Fixed and Working

