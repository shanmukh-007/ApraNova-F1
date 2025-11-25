# ApraNova LMS - Complete Architecture Flow

## Overview

This document describes the complete student journey through ApraNova LMS, from signup to project completion, with detailed architecture for each step.

---

## Step 1: Sign-up, Consent & Payment

### Student Journey
1. Student lands on ApraNova marketing page
2. Clicks "Get Started" → Sign-up page
3. Creates account (email/password or OAuth)
4. **Must accept privacy policy** (GDPR requirement)
5. Chooses track: Data Professional (DP) or Full-Stack Developer (FSD)
6. Pays via Stripe
7. Account enrolled, tools provisioned

### Architecture

#### Frontend (Next.js)
- **Sign-up form** with email/password fields
- **Privacy policy modal** with checkbox (required)
- **Track selection cards** (DP vs FSD with pricing)
- **Stripe Checkout** integration
- **Success page** with redirect to dashboard

#### Backend (Django)
- **User creation** endpoint: `POST /api/auth/registration/`
  - Validates email uniqueness
  - Hashes password
  - Stores `privacy_accepted_at`, `privacy_version`
  - Creates `UserConsent` record
  - Sets `enrollment_status = 'PENDING_PAYMENT'`
  
- **Payment creation** endpoint: `POST /api/payments/create-payment/`
  - Creates Stripe PaymentIntent
  - Stores payment record with track metadata
  
- **Webhook handler**: `POST /api/payments/webhook/`
  - Receives `payment_intent.succeeded`
  - Updates user: `enrollment_status = 'ENROLLED'`
  - Provisions tools based on track
  - Unlocks first project
  - Sends welcome email

#### Database (PostgreSQL)
```sql
-- User table
users (
  id, email, password_hash, name, role,
  track, enrollment_status, payment_verified,
  privacy_accepted, privacy_accepted_at, privacy_version,
  workspace_url, superset_url, prefect_url, jupyter_url,
  tools_provisioned, provisioned_at
)

-- Payment table
payments (
  id, user_id, stripe_payment_intent, amount, currency,
  status, track, account_created, tools_provisioned
)

-- Consent table
user_consents (
  id, user_id, privacy_policy_version, terms_version,
  accepted_at, ip_address
)
```

#### Stripe
- Handles payment processing
- Sends webhook events
- Only payment references stored in DB (not card data)

#### GDPR Compliance
- ✅ TLS everywhere (HTTPS)
- ✅ Encryption at rest (RDS, EFS)
- ✅ Privacy consent tracking
- ✅ Audit logging
- ✅ Data retention policies
- ✅ Right to access (data export)
- ✅ Right to erasure (account deletion)

---

## Step 2: Student Dashboard & Curriculum View

### Student Journey
1. Student logs in
2. Sees dashboard with:
   - Track name (DP or FSD)
   - List of projects in order
   - Progress status per project
   - Links to external tools
   - Current project highlighted

### Track-Specific Projects

#### Data Professional (DP)
1. **Project 1: Business Analytics Dashboard**
   - Tools: Python, Pandas, Postgres, Superset
   - Deliverables: Dashboard URL, SQL scripts, PDF report
   
2. **Project 2: Automated ETL Pipeline**
   - Tools: Prefect, Python, Postgres
   - Deliverables: Pipeline code, GitHub repo, email reports
   
3. **Project 3: Cloud Data Warehouse + Superset Capstone**
   - Tools: BigQuery/Redshift, Superset, dbt
   - Deliverables: Cloud dashboard, dbt models, documentation

#### Full-Stack Developer (FSD)
1. **Project 1: Portfolio Website**
   - Tools: React, Next.js, Tailwind CSS
   - Deliverables: Live URL, GitHub repo
   
2. **Project 2: E-commerce Platform**
   - Tools: React, Django/Node, Postgres, Stripe
   - Deliverables: Live URL, GitHub repo, test credentials
   
3. **Project 3: Social Dashboard + DevOps Capstone**
   - Tools: React, Backend API, Docker, Cloud Hosting
   - Deliverables: Live URL, GitHub repo, CI/CD pipeline

### Architecture

#### Frontend (Next.js)
```typescript
// Dashboard component
<Dashboard>
  <TrackHeader track={user.track} />
  <ProgressOverview completed={2} total={3} />
  
  <ProjectList>
    {projects.map(project => (
      <ProjectCard
        key={project.id}
        title={project.title}
        status={project.status}  // Not Started, In Progress, Submitted, Graded
        locked={!project.unlocked}
        onStart={() => startProject(project.id)}
      />
    ))}
  </ProjectList>
  
  <ToolsPanel>
    {user.track === 'DP' && (
      <>
        <ToolLink url={user.superset_url} name="Superset" />
        <ToolLink url={user.prefect_url} name="Prefect" />
        <ToolLink url={user.jupyter_url} name="Jupyter" />
      </>
    )}
    {user.track === 'FSD' && (
      <ToolLink url={user.workspace_url} name="CodeServer" />
    )}
  </ToolsPanel>
</Dashboard>
```

#### Backend (Django)
```python
# API Endpoints

GET /api/curriculum/my-track/
# Returns user's track with all projects

GET /api/curriculum/projects/
# Returns list of projects for user's track with progress

GET /api/curriculum/projects/{id}/
# Returns detailed project info with steps and deliverables

POST /api/curriculum/projects/{id}/start/
# Marks project as started, provisions resources if needed

GET /api/curriculum/my-progress/
# Returns user's progress across all projects
```

#### Database Schema
```sql
-- Tracks
tracks (
  id, code, name, description, duration_weeks
)

-- Projects
projects (
  id, track_id, number, title, subtitle, description,
  project_type, tech_stack, estimated_hours, order
)

-- Project Steps
project_steps (
  id, project_id, step_number, title, description,
  estimated_minutes, resources, order
)

-- Deliverables
deliverables (
  id, project_id, title, description, deliverable_type,
  is_required, order
)

-- Student Progress
student_progress (
  id, student_id, project_id, step_id,
  is_completed, completed_at, started_at,
  github_repo_url, notes
)

-- Submissions
submissions (
  id, student_id, deliverable_id,
  submission_url, submission_text, submission_file,
  status, feedback, reviewed_by, reviewed_at
)
```

---

## Step 3: Doing a DP Track Project (Example)

### Project 1: Business Analytics Dashboard

#### Student Journey
1. Clicks "Start Project 1"
2. System provisions:
   - Postgres schema: `dp_student_{user_id}`
   - Database credentials
   - Superset access
3. Student receives:
   - Dataset (CSV download)
   - DB connection string
   - Instructions
4. Student works:
   - Cleans data in Python/Pandas
   - Loads into Postgres
   - Builds dashboard in Superset
   - Writes insights report (PDF)
5. Student submits:
   - Dashboard URL
   - SQL scripts / GitHub repo
   - PDF report
6. Marks project as submitted

### Architecture

#### When "Start Project" is Clicked

**Backend Action:**
```python
POST /api/curriculum/projects/1/start/

def start_project(request, project_id):
    user = request.user
    project = Project.objects.get(id=project_id)
    
    # Check if previous project is completed (if not first)
    if project.number > 1:
        previous_completed = check_previous_project_completed(user, project)
        if not previous_completed:
            return Response({"error": "Complete previous project first"})
    
    # Provision resources based on track and project
    if user.track == 'DP' and project.number == 1:
        # Provision Postgres schema
        db_credentials = provision_postgres_schema(user)
        
        # Store credentials securely
        store_credentials(user, db_credentials)
        
        # Provide dataset
        dataset_url = get_project_dataset(project)
    
    # Create progress entry
    StudentProgress.objects.create(
        student=user,
        project=project,
        started_at=timezone.now()
    )
    
    return Response({
        "project": project_data,
        "db_credentials": db_credentials,
        "dataset_url": dataset_url,
        "superset_url": user.superset_url,
        "instructions": project.instructions
    })
```

#### Postgres Schema Provisioning

**Service:**
```python
def provision_postgres_schema(user):
    """
    Create isolated Postgres schema for DP student
    """
    schema_name = f"dp_student_{user.id}"
    
    # Connect to main database
    conn = psycopg2.connect(settings.STUDENT_DB_URL)
    cursor = conn.cursor()
    
    # Create schema
    cursor.execute(f"CREATE SCHEMA IF NOT EXISTS {schema_name}")
    
    # Create user with limited permissions
    username = f"student_{user.id}"
    password = generate_secure_password()
    
    cursor.execute(f"""
        CREATE USER {username} WITH PASSWORD '{password}';
        GRANT USAGE ON SCHEMA {schema_name} TO {username};
        GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA {schema_name} TO {username};
        ALTER DEFAULT PRIVILEGES IN SCHEMA {schema_name} 
        GRANT ALL ON TABLES TO {username};
    """)
    
    conn.commit()
    
    # Store credentials in secrets manager or encrypted field
    credentials = {
        'host': settings.STUDENT_DB_HOST,
        'port': settings.STUDENT_DB_PORT,
        'database': settings.STUDENT_DB_NAME,
        'schema': schema_name,
        'username': username,
        'password': password,
        'connection_string': f"postgresql://{username}:{password}@{settings.STUDENT_DB_HOST}:{settings.STUDENT_DB_PORT}/{settings.STUDENT_DB_NAME}?options=-c%20search_path={schema_name}"
    }
    
    return credentials
```

#### Superset Configuration

**Options:**

1. **Shared Superset Instance** (Recommended for beginners)
   - One Superset instance for all students
   - Each student gets their own database connection
   - Connection points to their schema: `dp_student_{user_id}`
   - Students can only see their own dashboards

2. **Per-Student Superset** (Advanced)
   - Docker container per student
   - More isolation but higher resource usage

**Implementation (Shared):**
```python
def configure_superset_for_student(user, db_credentials):
    """
    Add database connection to Superset for student
    """
    superset_api = SupersetAPI(settings.SUPERSET_URL)
    
    # Create database connection
    connection = superset_api.create_database(
        database_name=f"Student_{user.id}_DB",
        sqlalchemy_uri=db_credentials['connection_string'],
        expose_in_sqllab=True,
        allow_run_async=True,
        owner_ids=[user.superset_user_id]
    )
    
    return connection
```

#### Storage (S3/EFS)

**For Submissions:**
```python
# Store PDF reports
s3_client.upload_file(
    pdf_file,
    bucket='apranova-submissions',
    key=f'students/{user.id}/projects/{project.id}/report.pdf'
)

# Store SQL scripts
s3_client.upload_file(
    sql_file,
    bucket='apranova-submissions',
    key=f'students/{user.id}/projects/{project.id}/scripts.sql'
)
```

#### Submission Flow

**API Endpoint:**
```python
POST /api/curriculum/submissions/

{
  "deliverable_id": 1,
  "submission_url": "https://superset.apranova.com/dashboard/123",
  "github_repo": "https://github.com/student/project1",
  "report_file": <file upload>
}

def create_submission(request):
    deliverable = Deliverable.objects.get(id=request.data['deliverable_id'])
    
    # Upload files to S3
    if 'report_file' in request.FILES:
        report_url = upload_to_s3(request.FILES['report_file'], user, project)
    
    # Create submission
    submission = Submission.objects.create(
        student=request.user,
        deliverable=deliverable,
        submission_url=request.data.get('submission_url'),
        github_repo=request.data.get('github_repo'),
        submission_file=report_url,
        status='PENDING'
    )
    
    # Notify trainer
    notify_trainer_new_submission(submission)
    
    return Response({"submission_id": submission.id})
```

---

## Step 4: Project 2 & 3 (Same Pattern)

### Project 2: Automated ETL Pipeline

**Tools Provisioned:**
- Prefect workspace (shared or isolated)
- Email service credentials
- Database access (same schema or new)

**Deliverables:**
- Prefect flow code (GitHub)
- Email report examples
- Documentation

### Project 3: Cloud DW + Superset Capstone

**Tools Provisioned:**
- BigQuery/Redshift credentials (student's own cloud account)
- dbt Cloud access (optional)

**Deliverables:**
- Cloud dashboard URL
- dbt models (GitHub)
- Architecture documentation

**Note:** ApraNova stores the dashboard URL and repo link, but doesn't host the cloud resources.

---

## Complete API Endpoints Summary

### Authentication
- `POST /api/auth/registration/` - Sign up
- `POST /api/auth/login/` - Login
- `POST /api/auth/logout/` - Logout
- `POST /api/auth/token/refresh/` - Refresh JWT

### Compliance
- `GET /api/compliance/privacy-policy/` - Get privacy policy
- `POST /api/compliance/accept-consent/` - Accept privacy & terms
- `POST /api/compliance/export-data/` - Export user data
- `POST /api/compliance/delete-account/` - Request deletion

### Payments
- `POST /api/payments/create-payment/` - Create payment intent
- `POST /api/payments/webhook/` - Stripe webhook
- `GET /api/payments/my-payments/` - Payment history

### Curriculum
- `GET /api/curriculum/my-track/` - Get user's track
- `GET /api/curriculum/projects/` - List projects
- `GET /api/curriculum/projects/{id}/` - Project details
- `POST /api/curriculum/projects/{id}/start/` - Start project
- `GET /api/curriculum/my-progress/` - User progress

### Submissions
- `POST /api/curriculum/submissions/` - Submit deliverable
- `GET /api/curriculum/my-submissions/` - List submissions
- `GET /api/curriculum/submissions/{id}/` - Submission details

### Tools (DP Track)
- `GET /api/tools/db-credentials/` - Get Postgres credentials
- `GET /api/tools/superset-access/` - Get Superset URL
- `GET /api/tools/prefect-access/` - Get Prefect URL

### Tools (FSD Track)
- `GET /api/tools/workspace-access/` - Get CodeServer URL

---

## Security & Best Practices

### Database Credentials
- Store in secrets manager (encrypted)
- Or encrypt in database using Fernet
- Never expose in API responses without authentication
- Rotate credentials periodically

### File Uploads
- Validate file types and sizes
- Scan for malware
- Store in S3 with private access
- Generate signed URLs for downloads

### Tool Access
- Use JWT tokens for authentication
- Implement rate limiting
- Log all access attempts
- Monitor for suspicious activity

### GDPR Compliance
- Log all data access
- Implement data retention policies
- Provide data export functionality
- Honor deletion requests (with legal holds for payments)

---

## Infrastructure Summary

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                      │
│                  Hosted on Vercel/Netlify                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Backend API (Django)                       │
│                  Hosted on ECS Fargate                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  - User Management                                   │  │
│  │  - Payment Processing                                │  │
│  │  - Curriculum Management                             │  │
│  │  - Tool Provisioning                                 │  │
│  │  - Submission Handling                               │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  PostgreSQL │  │    Redis    │  │   S3/EFS    │
│   (RDS)     │  │ (ElastiCache│  │  (Storage)  │
│             │  │              │  │             │
│ - Users     │  │ - Cache     │  │ - Files     │
│ - Projects  │  │ - Sessions  │  │ - Reports   │
│ - Progress  │  │             │  │ - Datasets  │
└─────────────┘  └─────────────┘  └─────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Student Tools                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  CodeServer  │  │   Superset   │  │   Prefect    │     │
│  │   (FSD)      │  │    (DP)      │  │    (DP)      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐                                          │
│  │   Jupyter    │                                          │
│  │    (DP)      │                                          │
│  └──────────────┘                                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   External Services                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │    Stripe    │  │   AWS SES    │  │   AWS SSM    │     │
│  │  (Payments)  │  │   (Email)    │  │ (Secrets)    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Status

### ✅ Completed
- User authentication & authorization
- Privacy consent tracking (GDPR)
- Payment processing (Stripe)
- Enrollment workflow
- Curriculum structure (tracks, projects, steps)
- Progress tracking
- Submission system
- Audit logging

### 🔄 In Progress
- Tool provisioning service
- Postgres schema provisioning
- Superset integration
- File upload to S3

### 📋 TODO
- Email notifications
- Trainer review dashboard
- Certificate generation
- Analytics dashboard
- Mobile app support

---

This architecture supports the complete student journey from signup to graduation while maintaining security, scalability, and GDPR compliance.
