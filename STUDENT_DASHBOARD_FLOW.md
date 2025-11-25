# Student Dashboard Flow - Complete Implementation

## Overview
The student dashboard has been updated to align with the complete student journey from sign-up to certification, following the architecture flow described in the curriculum specifications.

## Student Journey Stages

### 1. Sign-up, Consent & Payment
**What the student sees:**
- Marketing page → Sign-up form
- Privacy notice and GDPR consent
- Track selection (Data Professional or Full-Stack Developer)
- Stripe payment checkout

**Dashboard Status:**
- `enrollment_status: 'PENDING_PAYMENT'` - Shows payment required banner
- After payment: `enrollment_status: 'ENROLLED'`
- Privacy consent required before accessing curriculum

**Architecture Components:**
- Frontend: Next.js sign-up forms, privacy notice, Stripe checkout UI
- Backend: Django API creates user, stores `privacy_accepted_at`, `privacy_version`
- Database: User profile, enrollment status, payment references
- Stripe: Handles payments via webhooks

### 2. Dashboard & Curriculum View
**What the student sees:**
- Welcome banner with their name and track
- 4-card status overview:
  - Track type (DP or FSD)
  - Projects completed (X/3)
  - Tools status (Ready/Provisioning)
  - GitHub connection status
- Trainer information card
- All projects displayed with:
  - Lock status (🔒 Locked, Ready, In Progress, ✓ Complete)
  - Progress percentage
  - Step completion (X/Y steps)
  - Tech stack badges
  - Action buttons (Start/Continue/Review)

**Dashboard Features:**
```typescript
interface UserProfile {
  enrollment_status: 'PENDING_PAYMENT' | 'ENROLLED' | 'COMPLETED'
  payment_verified: boolean
  privacy_accepted: boolean
  tools_provisioned: boolean
  track: 'DP' | 'FSD'
  github_connected: boolean
}
```

**Project Unlocking Logic:**
- Project 1: Always unlocked
- Project 2: Unlocked when Project 1 is 100% complete
- Project 3 (Capstone): Unlocked when Project 2 is 100% complete

### 3. Data Professional (DP) Track Projects

#### Project 1: Business Analytics Dashboard
**Student workflow:**
1. Click "Start Project 1"
2. Receive:
   - Dataset (CSV) to download
   - Postgres schema credentials
   - Instructions for data cleaning, loading, dashboard creation
3. Work locally with Python/Pandas
4. Build dashboard in Superset
5. Submit:
   - Dashboard URL
   - SQL scripts / GitHub repo
   - PDF insights report

**Architecture:**
- Backend provisions Postgres schema: `dp_student_<id>`
- Stores DB credentials in `StudentDatabaseCredentials` model
- Superset URL stored in user profile
- Submission tracked in `Submission` model

#### Project 2: Automated ETL Pipeline
**Student workflow:**
1. Build ETL with Prefect
2. Set up email reports
3. Submit pipeline code and documentation

**Architecture:**
- Prefect URL provisioned and stored
- GitHub repo integration for code submission

#### Project 3: Cloud DW + Superset Capstone
**Student workflow:**
1. Deploy to BigQuery/Redshift
2. Create cloud-hosted dashboard
3. Submit cloud dashboard link and scripts

**Architecture:**
- External cloud (student's AWS free tier)
- ApraNova stores submission links and evaluates

### 4. Full-Stack Developer (FSD) Track Projects

#### Project 1: Portfolio Website
**Student workflow:**
1. Build React/Next.js portfolio
2. Deploy to Netlify/Vercel
3. Submit live URL and GitHub repo

**Architecture:**
- GitHub template repo auto-created
- Workspace (CodeServer) URL provisioned
- Submission tracking

#### Project 2: E-commerce Platform
**Student workflow:**
1. Build React frontend + Django/Spring backend
2. Implement Stripe sandbox checkout
3. Add Postgres persistence
4. Write unit tests
5. Submit:
   - Live demo URL
   - GitHub repo
   - Test proof/screenshots

**Architecture:**
- Workspace for development
- GitHub integration for code review
- Submission with multiple deliverables

#### Project 3: Social Dashboard + DevOps Capstone
**Student workflow:**
1. Build full-stack app
2. Implement Docker + Terraform
3. Deploy to AWS
4. Submit deployment documentation

**Architecture:**
- Student uses own AWS free tier
- ApraNova tracks submission and provides feedback

### 5. Feedback, Grading & Certification

**Student sees:**
- Submission status: Pending / Approved / Needs Revision
- Trainer feedback and comments
- After all projects approved:
  - Track status: Completed
  - Certificate download button
  - LinkedIn/GitHub share links

**Architecture:**
- `Submission` model tracks status and feedback
- Certificate generation service (HTML → PDF)
- Certificate stored in S3/EFS
- Email notification via SES

### 6. GDPR & Data Handling

**Student controls:**
- View what data is collected
- Understand retention periods:
  - Logs: 90 days
  - User data: 30 days post-graduation
  - Payment records: 7 years (legal requirement)
- Request account deletion (except payment data)

**Architecture:**
- Encryption at rest + in transit
- Auto-deletion of logs and backups
- Anonymization endpoint
- "Delete my account" button in settings

## Dashboard Components

### Status Banners
1. **Payment Required** (enrollment_status: PENDING_PAYMENT)
   - Amber alert with payment button
   
2. **Privacy Consent Required** (enrolled but !privacy_accepted)
   - Blue alert with privacy policy link
   
3. **Completed Track** (enrollment_status: COMPLETED)
   - Green alert with certificate download

### Project Cards
Each project card shows:
- Project number and title
- Subtitle/description
- Tech stack badges
- Progress bar (0-100%)
- Step completion (X/Y)
- Status badge (Locked/Ready/In Progress/Complete)
- Action buttons (Start/Continue/Review/GitHub)
- Lock icon for locked projects

### Tool Cards Section
Dynamically shows tools based on:
- Track type (DP vs FSD)
- Current project number
- Tool provisioning status

**DP Track Tools:**
- Jupyter (Projects 1-3)
- Superset (Projects 1, 3)
- Prefect (Project 2)
- Postgres credentials

**FSD Track Tools:**
- Workspace/CodeServer (All projects)
- GitHub integration
- Deployment platforms (Netlify, AWS)

### Quick Actions
- Project Guide
- Take Quizzes
- Launch Workspace
- Submit Project
- Schedule Call with Trainer

## API Endpoints Used

```typescript
// User profile with enrollment status
GET /api/users/profile
Response: {
  name, email, track, enrollment_status,
  payment_verified, privacy_accepted,
  tools_provisioned, assigned_trainer,
  superset_url, prefect_url, jupyter_url, workspace_url,
  github_username, github_connected
}

// Curriculum tracks with projects
GET /api/curriculum/tracks
Response: [{
  code, name, description, projects: [{
    id, number, title, subtitle, description,
    project_type, tech_stack, estimated_hours,
    progress_percentage, is_unlocked,
    github_repo_url, steps: [...]
  }]
}]

// Mark step complete
POST /api/curriculum/progress/mark_step_complete
Body: { step_id, project_id }

// Submit project deliverable
POST /api/curriculum/submissions
Body: {
  deliverable_id, submission_url,
  submission_text, github_pr_url
}
```

## Database Models

### Key Models
1. **CustomUser** - User profile, enrollment, tools, GDPR
2. **Track** - DP or FSD track definition
3. **Project** - Individual projects within track
4. **ProjectStep** - Workflow steps within project
5. **Deliverable** - Expected outputs (URL, GitHub, PDF, etc)
6. **StudentProgress** - Tracks completion of steps
7. **Submission** - Student submissions with review status
8. **StudentDatabaseCredentials** - DP student DB access

## Security & Compliance

### GDPR Implementation
- TLS everywhere (HTTPS)
- Encryption at rest (RDS, EFS, S3)
- Log retention policies (CloudWatch)
- Secrets management (AWS SSM)
- Privacy consent tracking
- Data deletion/anonymization endpoints

### Access Control
- Students see only their own data
- Trainers see their assigned students (max 20)
- Admins have full access
- GitHub tokens encrypted
- DB credentials encrypted

## Next Steps for Students

### After Dashboard Update
1. **Complete Payment** (if pending)
2. **Accept Privacy Policy** (if not accepted)
3. **Connect GitHub** (for code submissions)
4. **Start Project 1** (always unlocked)
5. **Complete steps sequentially**
6. **Submit deliverables**
7. **Receive feedback**
8. **Unlock next project**
9. **Complete all 3 projects**
10. **Download certificate**

## Technical Implementation

### Frontend (Next.js)
- `app/student/dashboard/page.tsx` - Main dashboard
- `components/student/tool-cards-section.tsx` - Tool cards
- `components/student/project-card-enhanced.tsx` - Project cards
- `lib/curriculum-api.ts` - API client

### Backend (Django)
- `curriculum/models.py` - Data models
- `curriculum/views.py` - API endpoints
- `curriculum/serializers.py` - Data serialization
- `accounts/models.py` - User model
- `payments/stripe_service.py` - Payment handling

### Infrastructure (AWS)
- ECS Fargate - Container hosting
- RDS Aurora - Postgres database
- ElastiCache Redis - Caching
- EFS - File storage
- S3 - Object storage
- CloudWatch - Logging
- SSM - Secrets management

## Success Metrics

### Student Engagement
- Time to complete first project
- Project completion rate
- Submission quality scores
- Trainer feedback response time

### Platform Health
- Dashboard load time < 2s
- API response time < 500ms
- Tool provisioning success rate > 99%
- Zero data breaches (GDPR compliance)

## Support & Resources

### For Students
- Project Guide: `/student/project-guide`
- Quizzes: `/student/quizzes`
- Workspace: `/student/workspace`
- Submit: `/student/submit`
- Trainer Contact: Via dashboard card

### For Trainers
- Student List: `/trainer/students`
- Review Submissions: `/trainer/reviews`
- Provide Feedback: Via submission interface

### For Admins
- User Management: Django Admin
- Track Configuration: Django Admin
- Payment Monitoring: Stripe Dashboard
- Infrastructure: AWS Console
