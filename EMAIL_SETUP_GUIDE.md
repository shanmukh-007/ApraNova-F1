# Email Configuration Guide

## Quick Setup for Development

For development, emails are printed to the console (terminal) by default. No setup needed!

## Production SMTP Setup

### Option 1: Gmail SMTP (Recommended for Small Scale)

**Step 1: Enable 2-Factor Authentication**
1. Go to https://myaccount.google.com/security
2. Enable "2-Step Verification" if not already enabled

**Step 2: Generate App Password**
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Other (Custom name)"
3. Enter "ApraNova" as the name
4. Click "Generate"
5. Copy the 16-character password (format: `abcd efgh ijkl mnop`)

**Step 3: Update `.env` file**
```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=abcdefghijklmnop  # Your 16-char app password (no spaces)
DEFAULT_FROM_EMAIL=ApraNova <your-email@gmail.com>
```

**Step 4: Enable Email Verification in Django**
In `backend/core/settings.py`, change:
```python
ACCOUNT_EMAIL_VERIFICATION = "mandatory"  # or "optional"
```

**Step 5: Restart Backend Server**
```bash
# Stop current server (Ctrl+C)
python manage.py runserver
```

**Gmail Limits:**
- 500 emails per day (free Gmail)
- 2,000 emails per day (Google Workspace)

---

### Option 2: SendGrid (Recommended for Production)

**Step 1: Create SendGrid Account**
1. Sign up at https://sendgrid.com/ (Free tier: 100 emails/day)
2. Verify your email address
3. Create an API key: Settings → API Keys → Create API Key

**Step 2: Update `.env` file**
```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=SG.your-sendgrid-api-key-here
DEFAULT_FROM_EMAIL=ApraNova <noreply@yourdomain.com>
```

**SendGrid Limits:**
- Free: 100 emails/day
- Essentials: $19.95/month for 50,000 emails/month

---

### Option 3: AWS SES (Best for High Volume)

**Step 1: Set up AWS SES**
1. Go to AWS Console → SES
2. Verify your domain or email address
3. Request production access (starts in sandbox mode)
4. Create SMTP credentials

**Step 2: Update `.env` file**
```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com  # Your region
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-smtp-username
EMAIL_HOST_PASSWORD=your-smtp-password
DEFAULT_FROM_EMAIL=ApraNova <noreply@yourdomain.com>
```

**AWS SES Pricing:**
- $0.10 per 1,000 emails
- Very cost-effective for high volume

---

### Option 4: Mailgun (Good Balance)

**Step 1: Create Mailgun Account**
1. Sign up at https://www.mailgun.com/
2. Add and verify your domain
3. Get SMTP credentials from Settings → SMTP

**Step 2: Update `.env` file**
```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=postmaster@yourdomain.mailgun.org
EMAIL_HOST_PASSWORD=your-mailgun-password
DEFAULT_FROM_EMAIL=ApraNova <noreply@yourdomain.com>
```

**Mailgun Limits:**
- Free: 5,000 emails/month for 3 months
- Foundation: $35/month for 50,000 emails/month

---

## Testing Email Configuration

### Test 1: Django Shell
```bash
python manage.py shell
```

```python
from django.core.mail import send_mail

send_mail(
    'Test Email',
    'This is a test email from ApraNova.',
    'noreply@apranova.com',
    ['recipient@example.com'],
    fail_silently=False,
)
```

### Test 2: Create Test User
Try signing up a new user - you should receive a verification email.

---

## Email Verification Settings

In `backend/core/settings.py`:

```python
# No verification (current setting for development)
ACCOUNT_EMAIL_VERIFICATION = "none"

# Optional verification (users can login without verifying)
ACCOUNT_EMAIL_VERIFICATION = "optional"

# Mandatory verification (users must verify before login)
ACCOUNT_EMAIL_VERIFICATION = "mandatory"
```

---

## Troubleshooting

### Gmail: "Username and Password not accepted"
- Make sure you're using an App Password, not your regular Gmail password
- Remove spaces from the app password
- Check that 2FA is enabled

### SendGrid: "Authentication failed"
- Make sure EMAIL_HOST_USER is exactly "apikey" (not your username)
- Verify your API key is correct

### AWS SES: "Email address not verified"
- In sandbox mode, both sender and recipient must be verified
- Request production access to send to any email

### General Issues
- Check firewall isn't blocking port 587
- Try port 465 with EMAIL_USE_SSL=True instead of EMAIL_USE_TLS
- Check spam folder for test emails

---

## Current Configuration

Your current setup uses **console backend** for development:
- Emails are printed to the terminal/console
- No SMTP credentials needed
- Perfect for development and testing
- Switch to SMTP backend when ready for production

To see emails in development, check your backend terminal output after signup/password reset.
