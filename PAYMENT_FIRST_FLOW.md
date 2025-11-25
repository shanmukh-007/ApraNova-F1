# Payment-First Flow Architecture

## Overview

Users pay BEFORE creating an account. The system creates the account and provisions tools after successful payment.

## Complete User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                    1. Landing Page                              │
│                                                                 │
│  [Get Started Button] ──────────────────────────────────────>  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                2. Track Selection Page                          │
│                                                                 │
│  ┌──────────────────┐         ┌──────────────────┐            │
│  │  Full-Stack Dev  │         │  Data Pipeline   │            │
│  │      (FSD)       │         │       (DP)       │            │
│  │     $599         │         │      $499        │            │
│  └──────────────────┘         └──────────────────┘            │
│                                                                 │
│  User selects track → Proceeds to payment                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              3. Stripe Checkout (No Account Yet)               │
│                                                                 │
│  - Email (required)                                             │
│  - Name (required)                                              │
│  - Card details                                                 │
│  - Metadata: {track: "FSD", email: "user@example.com"}        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              4. Payment Successful → Webhook Fires              │
│                                                                 │
│  Backend receives: payment_intent.succeeded                     │
│  Metadata contains: email, name, track                          │
│                                                                 │
│  Actions:                                                       │
│  ✅ Create user account (email, auto-generated password)        │
│  ✅ Set track (FSD or DP)                                       │
│  ✅ Set enrollment_status = 'ENROLLED'                          │
│  ✅ Provision tools based on track:                             │
│     - FSD: CodeServer workspace                                 │
│     - DP: Superset + Prefect + Jupyter                          │
│  ✅ Unlock first project                                        │
│  ✅ Send welcome email with login credentials                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│           5. Redirect to Success Page with Auto-Login           │
│                                                                 │
│  - Generate JWT token for new user                              │
│  - Redirect to: /payment/success?token=xxx&track=FSD           │
│  - Frontend auto-logs in user                                   │
│  - Redirects to dashboard                                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  6. Track-Specific Dashboard                    │
│                                                                 │
│  FSD Dashboard:                                                 │
│  - Access to CodeServer workspace                               │
│  - Project 1: Portfolio Website                                 │
│  - GitHub integration                                           │
│                                                                 │
│  DP Dashboard:                                                  │
│  - Access to Superset                                           │
│  - Access to Prefect                                            │
│  - Access to Jupyter/Streamlit                                  │
│  - Project 1: Business Analytics Dashboard                      │
└─────────────────────────────────────────────────────────────────┘
```

## Implementation Changes Needed

### 1. Anonymous Checkout Session
Users don't need an account to start payment.

### 2. Webhook Creates Account
After payment success, webhook creates the user account.

### 3. Tool Provisioning Service
Automatically provisions tools based on track.

### 4. Auto-Login Token
Generate a one-time login token for the new user.

## API Flow

### Step 1: Create Checkout Session (No Auth Required)

```http
POST /api/payments/create-anonymous-checkout/
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "track": "FSD",
  "success_url": "https://apranova.com/payment/success",
  "cancel_url": "https://apranova.com/payment/cancel"
}

Response:
{
  "checkout_url": "https://checkout.stripe.com/c/pay/cs_test_xxx",
  "session_id": "cs_test_xxx"
}
```

### Step 2: Stripe Processes Payment

User completes payment on Stripe Checkout page.

### Step 3: Webhook Creates Account

```
Event: payment_intent.succeeded
Metadata: {
  "email": "user@example.com",
  "name": "John Doe",
  "track": "FSD"
}

Backend Actions:
1. Check if user exists (by email)
2. If not, create user:
   - email: from metadata
   - name: from metadata
   - username: generated from email
   - password: auto-generated (sent via email)
   - track: from metadata
   - enrollment_status: 'ENROLLED'
   - payment_verified: true
3. Provision tools based on track
4. Unlock first project
5. Generate one-time login token
6. Send welcome email with credentials
```

### Step 4: Redirect with Auto-Login

```
Stripe redirects to:
https://apranova.com/payment/success?session_id=cs_test_xxx

Frontend:
1. Calls /api/payments/verify-session/?session_id=cs_test_xxx
2. Backend returns:
   {
     "success": true,
     "user": {...},
     "access_token": "xxx",
     "refresh_token": "xxx",
     "track": "FSD"
   }
3. Frontend stores tokens
4. Redirects to /fsd/dashboard or /dp/dashboard
```

## Tool Provisioning

### FSD Track
```python
def provision_fsd_tools(user):
    # Create CodeServer workspace
    workspace = create_codeserver_workspace(
        user_id=user.id,
        workspace_name=f"fsd_{user.id}",
        port=8080 + user.id
    )
    
    # Store workspace URL
    user.workspace_url = workspace.url
    user.save()
    
    return workspace
```

### DP Track
```python
def provision_dp_tools(user):
    # Create Superset instance
    superset = create_superset_instance(
        user_id=user.id,
        db_name=f"dp_student_{user.id}"
    )
    
    # Create Prefect workspace
    prefect = create_prefect_workspace(
        user_id=user.id
    )
    
    # Create Jupyter environment
    jupyter = create_jupyter_environment(
        user_id=user.id
    )
    
    # Store tool URLs
    user.superset_url = superset.url
    user.prefect_url = prefect.url
    user.jupyter_url = jupyter.url
    user.save()
    
    return {
        'superset': superset,
        'prefect': prefect,
        'jupyter': jupyter
    }
```

## Database Schema Updates

### User Model Additions
```python
class CustomUser(AbstractUser):
    # ... existing fields ...
    
    # Tool Access URLs
    workspace_url = models.URLField(blank=True)  # CodeServer (FSD)
    superset_url = models.URLField(blank=True)   # Superset (DP)
    prefect_url = models.URLField(blank=True)    # Prefect (DP)
    jupyter_url = models.URLField(blank=True)    # Jupyter (DP)
    
    # Provisioning Status
    tools_provisioned = models.BooleanField(default=False)
    provisioned_at = models.DateTimeField(null=True, blank=True)
    provisioning_error = models.TextField(blank=True)
```

### Payment Model Additions
```python
class Payment(models.Model):
    # ... existing fields ...
    
    # For anonymous checkout
    customer_email = models.EmailField()
    customer_name = models.CharField(max_length=200)
    account_created = models.BooleanField(default=False)
    tools_provisioned = models.BooleanField(default=False)
```

## Security Considerations

### 1. Email Verification
- Send verification email after account creation
- User must verify email to access advanced features

### 2. Password Security
- Auto-generate strong password
- Force password change on first login
- Send password via secure email

### 3. One-Time Login Token
- Token expires after 1 hour
- Can only be used once
- Invalidated after successful login

### 4. Duplicate Prevention
- Check if email already exists before creating account
- If exists, link payment to existing account

## Error Handling

### Payment Success but Account Creation Fails
```python
try:
    user = create_user_from_payment(payment_intent)
    provision_tools(user, track)
except Exception as e:
    # Log error
    logger.error(f"Account creation failed: {e}")
    
    # Mark payment for manual review
    payment.account_created = False
    payment.provisioning_error = str(e)
    payment.save()
    
    # Send alert to admin
    notify_admin_account_creation_failed(payment_intent)
    
    # Send email to customer
    send_manual_setup_email(customer_email)
```

### Tool Provisioning Fails
```python
try:
    provision_tools(user, track)
except Exception as e:
    # Account exists but tools failed
    user.tools_provisioned = False
    user.provisioning_error = str(e)
    user.save()
    
    # User can still login
    # Show "Tools are being set up" message
    # Retry provisioning in background
```

## Email Templates

### Welcome Email (with credentials)
```
Subject: Welcome to ApraNova - Your Account is Ready!

Hi {name},

Thank you for enrolling in the {track_name} track!

Your account has been created:
- Email: {email}
- Temporary Password: {password}

Your tools are ready:
{tool_links}

Get started: {dashboard_url}

Please change your password after logging in.

Best regards,
ApraNova Team
```

## Frontend Changes

### 1. Track Selection Page
```typescript
// No authentication required
<TrackCard 
  track="FSD"
  price={599}
  onClick={() => handleCheckout('FSD')}
/>

async function handleCheckout(track: string) {
  const response = await fetch('/api/payments/create-anonymous-checkout/', {
    method: 'POST',
    body: JSON.stringify({
      email: userEmail,
      name: userName,
      track: track,
      success_url: window.location.origin + '/payment/success',
      cancel_url: window.location.origin + '/payment/cancel'
    })
  });
  
  const { checkout_url } = await response.json();
  window.location.href = checkout_url;
}
```

### 2. Payment Success Page
```typescript
// /payment/success?session_id=cs_test_xxx

useEffect(() => {
  const sessionId = new URLSearchParams(window.location.search).get('session_id');
  
  if (sessionId) {
    verifyAndLogin(sessionId);
  }
}, []);

async function verifyAndLogin(sessionId: string) {
  const response = await fetch(`/api/payments/verify-session/?session_id=${sessionId}`);
  const { access_token, refresh_token, track, user } = await response.json();
  
  // Store tokens
  localStorage.setItem('access_token', access_token);
  localStorage.setItem('refresh_token', refresh_token);
  
  // Redirect to dashboard
  router.push(`/${track.toLowerCase()}/dashboard`);
}
```

## Testing Checklist

- [ ] Anonymous user can select track
- [ ] Checkout session created without auth
- [ ] Payment succeeds in Stripe
- [ ] Webhook creates user account
- [ ] Tools are provisioned correctly (FSD)
- [ ] Tools are provisioned correctly (DP)
- [ ] Welcome email sent with credentials
- [ ] User can auto-login with token
- [ ] User redirected to correct dashboard
- [ ] Duplicate email handling works
- [ ] Error handling for failed provisioning
- [ ] Admin notified of failures

## Next Steps

1. Implement anonymous checkout endpoint
2. Update webhook to create accounts
3. Build tool provisioning service
4. Create auto-login token system
5. Update frontend flow
6. Test end-to-end
