# Architecture Fixes Required

## Current State vs Required State

### ✅ Already Implemented
1. User authentication (email/password, OAuth)
2. Role-based access (student, trainer, admin, superadmin)
3. Track selection (DP, FSD)
4. Stripe payment integration
5. Curriculum structure (Track → Project → Steps → Deliverables)
6. Student progress tracking
7. Submission system
8. GitHub integration for projects
9. Trainer assignment (auto-assign, max 20 students)

### ❌ Missing - GDPR & Privacy Compliance

#### 1. Privacy Consent & GDPR Fields (HIGH PRIORITY)
**Location**: `backend/accounts/models.py`

Missing fields in CustomUser model:
- `privacy_accepted` (BooleanField)
- `privacy_accepted_at` (DateTimeField)
- `privacy_version` (CharField) - track which version of privacy policy was accepted
- `data_retention_consent` (BooleanField)
- `marketing_consent` (BooleanField)
- `account_deletion_requested` (BooleanField)
- `account_deletion_requested_at` (DateTimeField)
- `anonymized` (BooleanField)

**Action**: Add migration to include these fields

#### 2. Privacy Policy & Terms Management
**Location**: New app `backend/compliance/`

Need to create:
- `PrivacyPolicy` model (version, content, effective_date, is_active)
- `TermsOfService` model (version, content, effective_date, is_active)
- `UserConsent` model (user, policy_version, terms_version, accepted_at, ip_address)

#### 3. Data Retention & Deletion
**Location**: `backend/accounts/` and `backend/compliance/`

Need to implement:
- API endpoint: `DELETE /api/accounts/delete-account/` - Request account deletion
- API endpoint: `POST /api/accounts/anonymize/` - Anonymize user data
- Management command: `python manage.py cleanup_expired_data` - Auto-delete old logs/data
- Retention policies:
  - Logs: 90 days
  - User data: 30 days post-graduation (unless legal hold)
  - Payment records: 7 years (legal requirement)

#### 4. Audit Logging
**Location**: New app `backend/audit/`

Need to create:
- `AuditLog` model (user, action, resource, ip_address, timestamp, details)
- Middleware to log sensitive actions
- Log retention: 90 days

### ❌ Missing - Enrollment & Payment Flow

#### 5. Enrollment Status Tracking
**Location**: `backend/accounts/models.py` or new `backend/enrollment/`

Missing fields/model:
- `enrollment_status` (PENDING_PAYMENT, ENROLLED, SUSPENDED, COMPLETED)
- `enrolled_at` (DateTimeField)
- `graduation_date` (DateTimeField)
- `payment_verified` (BooleanField)

**Current Issue**: Payment exists but no clear enrollment state management

#### 6. Payment → Enrollment Workflow
**Location**: `backend/payments/views.py`

Current webhook handler is incomplete:
- ✅ Updates payment status
- ❌ Does NOT create enrollment record
- ❌ Does NOT assign student to track properly
- ❌ Does NOT send confirmation email
- ❌ Does NOT initialize student progress

**Action**: Enhance `stripe_webhook` to:
1. Verify payment success
2. Create/update enrollment record
3. Assign track to user
4. Initialize first project (unlock Project 1)
5. Send welcome email with credentials
6. Trigger Slack/admin notification

### ❌ Missing - Student Workspace Provisioning

#### 7. Database Schema Provisioning (DP Track)
**Location**: New service `backend/workspace/`

For Data Professional students:
- When Project 1 starts → Create Postgres schema `dp_student_<user_id>`
- Store credentials securely (encrypted in DB or secrets manager)
- API endpoint: `GET /api/workspace/db-credentials/` - Return connection string
- Cleanup: Drop schema after project completion or 90 days

**Current State**: No workspace provisioning exists

#### 8. External Tool Integration
**Location**: `backend/curriculum/models.py` and new `backend/integrations/`

Need to track:
- Superset dashboard URLs (DP students)
- Jupyter notebook links
- Netlify/Vercel deployment URLs (FSD students)
- Cloud resource links (capstone projects)

Add to `Submission` model or create `ExternalResource` model:
- `resource_type` (SUPERSET, JUPYTER, NETLIFY, CLOUD, etc.)
- `resource_url`
- `credentials_stored` (boolean)
- `provisioned_at`
- `deprovisioned_at`

### ❌ Missing - Certificate Generation

#### 9. Certificate System
**Location**: New app `backend/certificates/`

Need to create:
- `Certificate` model (user, track, issued_at, certificate_url, verification_code)
- Certificate generation service (HTML → PDF using WeasyPrint)
- API endpoint: `POST /api/certificates/generate/` - Generate certificate
- API endpoint: `GET /api/certificates/<verification_code>/` - Verify certificate
- Store PDFs in S3/EFS

**Trigger**: When all required projects in track are completed

### ❌ Missing - Email Notifications

#### 10. Email Service Integration
**Location**: `backend/core/` or new `backend/notifications/`

Required emails:
1. Welcome email (after payment)
2. Project unlocked notification
3. Submission received confirmation
4. Feedback available notification
5. Certificate issued
6. Account deletion confirmation
7. Data export ready

**Action**: 
- Configure email service (SMTP/SendGrid) in settings
- Create email templates
- Implement email service class

### ❌ Missing - Admin Enrollment Override

#### 11. Manual Enrollment by Admin
**Location**: `backend/accounts/views.py` or new `backend/enrollment/views.py`

Need API endpoint:
- `POST /api/admin/enroll-student/` - Manually enroll student without payment
- Fields: user_id, track, bypass_payment, notes

**Use Case**: Scholarships, testing, special cases

### ❌ Missing - Data Export (GDPR Right to Access)

#### 12. User Data Export
**Location**: `backend/accounts/views.py`

Need API endpoint:
- `GET /api/accounts/export-data/` - Export all user data as JSON/ZIP
- Include: profile, progress, submissions, payments (refs only), certificates

## Implementation Priority

### Phase 1: CRITICAL (Week 1)
1. ✅ Privacy consent fields in User model
2. ✅ Privacy policy acceptance during signup
3. ✅ Payment → Enrollment workflow fix
4. ✅ Email notifications (basic)

### Phase 2: HIGH (Week 2)
5. ✅ Enrollment status management
6. ✅ Certificate generation system
7. ✅ Data export endpoint
8. ✅ Account deletion endpoint

### Phase 3: MEDIUM (Week 3)
9. ✅ Audit logging
10. ✅ Workspace provisioning (DP track)
11. ✅ External tool integration tracking
12. ✅ Admin manual enrollment

### Phase 4: ONGOING
13. ✅ Data retention automation
14. ✅ Log cleanup cron jobs
15. ✅ Monitoring & compliance reports

## Database Migrations Needed

1. Add GDPR fields to CustomUser
2. Create PrivacyPolicy table
3. Create UserConsent table
4. Create AuditLog table
5. Create Certificate table
6. Create Enrollment table (or add fields to CustomUser)
7. Add workspace fields to StudentProgress

## Infrastructure Changes Needed

1. Email service configuration (SMTP/SendGrid)
2. Secrets manager for storing student DB credentials
3. File storage for certificates and data exports
4. Log retention policies (90 days)
5. RDS encryption at rest (should already be enabled)
6. EFS encryption at rest (should already be enabled)

## Frontend Changes Needed

1. Privacy policy acceptance checkbox on signup
2. Terms of service modal
3. Account settings → Delete account button
4. Account settings → Export data button
5. Certificate download page
6. Workspace credentials display (DP students)

## Testing Checklist

- [ ] Signup with privacy acceptance
- [ ] Payment → Enrollment flow
- [ ] Certificate generation
- [ ] Data export
- [ ] Account deletion
- [ ] Workspace provisioning
- [ ] Email notifications
- [ ] Audit logging
- [ ] GDPR compliance verification
