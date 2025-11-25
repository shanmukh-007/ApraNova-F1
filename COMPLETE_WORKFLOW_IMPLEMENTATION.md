# Complete Student Workflow Implementation Plan

## Current Status vs Required Workflow

### ✅ Already Implemented

1. **Step 1: Sign-up, Consent & Payment**
   - ✅ Sign-up form with email/password
   - ✅ Privacy consent tracking (privacy_accepted, privacy_version)
   - ✅ Track selection (DP/FSD)
   - ✅ Stripe payment integration
   - ✅ Payment-first flow (Get Started → Track → Payment → Account Creation)
   - ✅ GDPR compliance models and endpoints

2. **Step 2: Student Dashboard**
   - ✅ Track display (DP/FSD)
   - ✅ Project list with curriculum structure
   - ✅ Progress tracking per project
   - ✅ Tool cards section
   - ✅ Trainer assignment display

3. **Database & Models**
   - ✅ User model with privacy fields
   - ✅ Track and Project models
   - ✅ StudentProgress model
   - ✅ Payment tracking
   - ✅ Compliance models

### 🔧 Needs Enhancement

#### 1. **Project Start Flow** (Critical)
**Current:** Students see projects but no clear "Start Project" action
**Needed:**
- [ ] "Start Project" button for each project
- [ ] Project status: Not Started / In Progress / Submitted / Graded
- [ ] Project provisioning on start (DB schema, credentials)
- [ ] Clear instructions and requirements display

#### 2. **DP Track Project Workflow**
**Current:** Tools are shown but no guided workflow
**Needed:**
- [ ] Dataset download link for Project 1
- [ ] DB credentials display (already partially done)
- [ ] Step-by-step checklist for each project
- [ ] Submission form (Dashboard URL, SQL scripts, PDF report)
- [ ] File upload for artifacts

#### 3. **FSD Track Project Workflow**
**Current:** Basic structure exists
**Needed:**
- [ ] Project requirements/spec display
- [ ] API endpoints documentation
- [ ] Stripe sandbox keys for Project 2
- [ ] Submission form (Live URL, GitHub repo, screenshots)
- [ ] Deployment instructions

#### 4. **Submission & Review System**
**Current:** Not implemented
**Needed:**
- [ ] Submission form per project
- [ ] Status tracking (Submitted → Under Review → Graded)
- [ ] Feedback display from trainers
- [ ] Resubmission capability

#### 5. **Certificate Generation**
**Current:** Not implemented
**Needed:**
- [ ] Certificate generation on track completion
- [ ] PDF certificate with student name, track, date
- [ ] Download link
- [ ] Email notification

## Implementation Priority

### Phase 1: Project Start & Workflow (IMMEDIATE)
1. Add "Start Project" button with provisioning
2. Add project status badges (Not Started, In Progress, etc.)
3. Add project instructions/requirements section
4. Add submission form

### Phase 2: Submission & Review (HIGH)
1. Create submission endpoints
2. Add file upload capability
3. Add trainer review interface
4. Add feedback display

### Phase 3: Certificate & Completion (MEDIUM)
1. Certificate generation service
2. Track completion detection
3. Email notifications
4. Certificate download

## UI Changes Needed for Student Dashboard

### 1. Project Card Enhancement
```
┌─────────────────────────────────────────┐
│ 📊 Project 1: Business Analytics        │
│                                         │
│ Status: [Not Started]                   │
│ Progress: 0/6 steps                     │
│                                         │
│ [Start Project] [View Requirements]     │
└─────────────────────────────────────────┘
```

### 2. Active Project View
```
┌─────────────────────────────────────────┐
│ 📊 Project 1: Business Analytics        │
│                                         │
│ Status: [In Progress] 40% Complete      │
│                                         │
│ ✓ Step 1: Clean CSV data               │
│ ✓ Step 2: Load to PostgreSQL           │
│ ⚡ Step 3: Write SQL queries (Active)   │
│ ○ Step 4: Connect Superset             │
│ ○ Step 5: Build dashboard              │
│ ○ Step 6: Write insights report        │
│                                         │
│ [Continue] [Submit Project]             │
└─────────────────────────────────────────┘
```

### 3. Project Resources Section
```
┌─────────────────────────────────────────┐
│ 📦 Project Resources                    │
│                                         │
│ 📄 Dataset: sales_data.csv [Download]  │
│ 🗄️ Database: dp_student_123            │
│    Host: localhost:5433                 │
│    [Copy Credentials]                   │
│                                         │
│ 📚 Documentation: [View Guide]          │
│ 💬 Ask Questions: [Discord]             │
└─────────────────────────────────────────┘
```

### 4. Submission Form
```
┌─────────────────────────────────────────┐
│ 📤 Submit Project 1                     │
│                                         │
│ Dashboard URL:                          │
│ [http://localhost:8088/dashboard/1]    │
│                                         │
│ GitHub Repository:                      │
│ [https://github.com/user/project1]     │
│                                         │
│ SQL Scripts:                            │
│ [Upload File] queries.sql               │
│                                         │
│ Insights Report (PDF):                  │
│ [Upload File] insights.pdf              │
│                                         │
│ [Submit for Review]                     │
└─────────────────────────────────────────┘
```

## Database Schema Additions Needed

### 1. ProjectSubmission Model
```python
class ProjectSubmission(models.Model):
    student = ForeignKey(User)
    project = ForeignKey(Project)
    status = CharField(choices=[
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('under_review', 'Under Review'),
        ('approved', 'Approved'),
        ('needs_revision', 'Needs Revision')
    ])
    dashboard_url = URLField(blank=True)
    github_repo_url = URLField(blank=True)
    live_demo_url = URLField(blank=True)
    submitted_at = DateTimeField()
    reviewed_at = DateTimeField(null=True)
    grade = IntegerField(null=True)
    feedback = TextField(blank=True)
```

### 2. ProjectResource Model
```python
class ProjectResource(models.Model):
    project = ForeignKey(Project)
    resource_type = CharField(choices=[
        ('dataset', 'Dataset'),
        ('documentation', 'Documentation'),
        ('template', 'Template'),
        ('credentials', 'Credentials')
    ])
    title = CharField(max_length=200)
    file = FileField(upload_to='project_resources/')
    url = URLField(blank=True)
```

### 3. Certificate Model
```python
class Certificate(models.Model):
    student = ForeignKey(User)
    track = ForeignKey(Track)
    issued_at = DateTimeField(auto_now_add=True)
    certificate_id = UUIDField(default=uuid.uuid4)
    pdf_file = FileField(upload_to='certificates/')
```

## API Endpoints Needed

### Project Management
- `POST /api/projects/{id}/start/` - Start a project (provision resources)
- `GET /api/projects/{id}/resources/` - Get project resources
- `GET /api/projects/{id}/requirements/` - Get project requirements

### Submissions
- `POST /api/projects/{id}/submit/` - Submit project
- `GET /api/submissions/{id}/` - Get submission details
- `PUT /api/submissions/{id}/` - Update submission
- `POST /api/submissions/{id}/files/` - Upload submission files

### Certificates
- `GET /api/certificates/` - Get student certificates
- `POST /api/certificates/generate/` - Generate certificate (admin)
- `GET /api/certificates/{id}/download/` - Download certificate PDF

## Next Steps

1. **Immediate:** Update dashboard UI to show project status and "Start Project" button
2. **Today:** Implement project start provisioning
3. **This Week:** Build submission system
4. **Next Week:** Add trainer review interface
5. **Following Week:** Certificate generation

## Files to Modify

### Frontend
- `frontend/app/student/dashboard/page.tsx` - Add project cards with status
- `frontend/components/student/project-card.tsx` - NEW: Project card component
- `frontend/components/student/submission-form.tsx` - NEW: Submission form
- `frontend/app/student/projects/[id]/page.tsx` - NEW: Individual project page

### Backend
- `backend/curriculum/models.py` - Add ProjectSubmission, ProjectResource, Certificate
- `backend/curriculum/views.py` - Add project start, submission endpoints
- `backend/curriculum/serializers.py` - Add submission serializers
- `backend/accounts/provisioning_service.py` - Enhance provisioning logic

This is the complete roadmap to align the UI with the actual student workflow!
