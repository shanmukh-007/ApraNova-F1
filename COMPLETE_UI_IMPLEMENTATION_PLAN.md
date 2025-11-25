# Complete UI Implementation Plan

Based on the architecture document, here's what needs to be built:

## ✅ Already Implemented

### Step 1: Sign-up, Consent & Payment
- ✅ Get Started page (`/get-started`)
- ✅ Track selection (DP vs FSD)
- ✅ Stripe checkout integration
- ✅ Privacy consent tracking (backend)
- ✅ Payment webhook (creates account, provisions tools)
- ✅ Success page with login instructions

### Step 2: Dashboard & Curriculum View
- ✅ Student dashboard (`/student/dashboard`)
- ✅ Track display
- ✅ Project list with progress
- ✅ Progress tracking
- ⚠️ **MISSING: Tool cards (Superset, Prefect, Jupyter, CodeServer, Discord)**

## 🔨 Need to Build

### Step 3: Project Workflow (DP Track Example)

#### Project Start Page
**File:** `frontend/app/student/project/[id]/start/page.tsx`

**Features:**
- Project overview
- Dataset download button
- Database credentials display (for DP)
- Instructions checklist
- "Start Project" button
- Tool access cards:
  - Superset (DP)
  - Prefect (DP)
  - Jupyter (DP)
  - PostgreSQL credentials (DP)
  - CodeServer (FSD)

#### Project Guide Page
**File:** `frontend/app/student/project-guide/page.tsx`

**Features:**
- Step-by-step instructions
- Requirements checklist
- Tech stack badges
- Resource links
- Video tutorials (optional)
- FAQ section

#### Submission Page
**File:** `frontend/app/student/submit/page.tsx`

**Features:**
- Project selector
- Deliverable checklist:
  - Dashboard URL (DP)
  - GitHub repo link
  - PDF report upload
  - Live demo URL (FSD)
  - Screenshots upload
- File upload component
- Submit button
- Submission history

### Step 4: FSD Project Workflow

#### Project Spec Page
**Features:**
- Requirements document
- API endpoints spec
- Database schema
- Stripe sandbox keys
- Testing checklist
- Deployment guide

### Step 5: Feedback & Grading

#### Submissions View
**File:** `frontend/app/student/submissions/page.tsx`

**Features:**
- List of all submissions
- Status badges (Pending, Approved, Needs Revision)
- Feedback display
- Grade/score
- Resubmit button
- Download certificate (when completed)

#### Certificate Page
**File:** `frontend/app/student/certificate/page.tsx`

**Features:**
- Certificate preview
- Download PDF button
- Share to LinkedIn
- Share to Twitter
- Verification code

### Step 6: GDPR & Account Management

#### Settings Page
**File:** `frontend/app/student/settings/page.tsx`

**Features:**
- Profile settings
- Privacy settings
- Data export button
- Delete account button
- Consent history
- Password change

## UI Components to Build

### 1. Tool Access Cards
**File:** `frontend/components/student/tool-cards.tsx`

```tsx
// For DP Track
<ToolCard
  icon={<SupersetIcon />}
  title="Apache Superset"
  description="Build your data visualizations"
  url={user.superset_url}
  status="active"
/>

<ToolCard
  icon={<PrefectIcon />}
  title="Prefect"
  description="Automate your workflows"
  url={user.prefect_url}
  status="active"
/>

<ToolCard
  icon={<JupyterIcon />}
  title="Jupyter Notebook"
  description="Analyze data interactively"
  url={user.jupyter_url}
  status="active"
/>

<ToolCard
  icon={<DatabaseIcon />}
  title="PostgreSQL"
  description="Your database workspace"
  credentials={dbCredentials}
  status="active"
/>

<ToolCard
  icon={<DiscordIcon />}
  title="Discord Community"
  description="Connect with students and mentors"
  url="https://discord.gg/apranova"
  status="active"
/>

// For FSD Track
<ToolCard
  icon={<CodeIcon />}
  title="CodeServer"
  description="Your cloud IDE"
  url={user.workspace_url}
  status="active"
/>

<ToolCard
  icon={<GithubIcon />}
  title="GitHub"
  description="Version control"
  url={user.github_repo_url}
  status="active"
/>

<ToolCard
  icon={<DiscordIcon />}
  title="Discord Community"
  description="Connect with students and mentors"
  url="https://discord.gg/apranova"
  status="active"
/>
```

### 2. Database Credentials Card
**File:** `frontend/components/student/db-credentials.tsx`

```tsx
<DatabaseCredentials
  host="db.apranova.com"
  port="5432"
  database="apranova_students"
  schema="dp_student_123"
  username="student_123"
  password="***********"
  connectionString="postgresql://..."
/>
```

### 3. File Upload Component
**File:** `frontend/components/student/file-upload.tsx`

```tsx
<FileUpload
  accept=".pdf,.zip,.png,.jpg"
  maxSize={10 * 1024 * 1024} // 10MB
  onUpload={handleUpload}
/>
```

### 4. Submission Form
**File:** `frontend/components/student/submission-form.tsx`

```tsx
<SubmissionForm
  projectId={projectId}
  deliverables={[
    { type: 'url', label: 'Dashboard URL', required: true },
    { type: 'url', label: 'GitHub Repo', required: true },
    { type: 'file', label: 'PDF Report', required: true },
  ]}
  onSubmit={handleSubmit}
/>
```

### 5. Feedback Display
**File:** `frontend/components/student/feedback-card.tsx`

```tsx
<FeedbackCard
  status="approved"
  grade={85}
  comments="Great work! Your dashboard is well-designed..."
  reviewedBy="Trainer Name"
  reviewedAt="2024-01-15"
/>
```

### 6. Certificate Component
**File:** `frontend/components/student/certificate.tsx`

```tsx
<Certificate
  studentName="John Doe"
  track="Data Professional"
  completionDate="2024-01-15"
  verificationCode="ABC123XYZ"
  downloadUrl="/certificates/123.pdf"
/>
```

## API Endpoints Needed

### Project Management
- `GET /api/curriculum/projects/{id}/start/` - Get project start info
- `POST /api/curriculum/projects/{id}/start/` - Mark project as started
- `GET /api/curriculum/projects/{id}/resources/` - Get datasets, credentials
- `GET /api/tools/db-credentials/` - Get PostgreSQL credentials (DP)

### Submissions
- `POST /api/curriculum/submissions/` - Submit project
- `GET /api/curriculum/submissions/` - List submissions
- `GET /api/curriculum/submissions/{id}/` - Get submission details
- `PUT /api/curriculum/submissions/{id}/` - Update submission

### Certificates
- `GET /api/certificates/` - Get user certificates
- `POST /api/certificates/generate/` - Generate certificate
- `GET /api/certificates/{id}/download/` - Download certificate PDF

### GDPR
- `POST /api/compliance/export-data/` - Export user data ✅
- `POST /api/compliance/delete-account/` - Request deletion ✅
- `GET /api/compliance/my-consents/` - Get consent history ✅

## Implementation Priority

### Phase 1: Tool Cards (Immediate)
1. Create ToolCard component
2. Add to dashboard based on track
3. Show Superset, Prefect, Jupyter, PostgreSQL (DP)
4. Show CodeServer, GitHub (FSD)
5. Add Discord to both

### Phase 2: Project Workflow
1. Project start page
2. Database credentials display
3. Dataset download
4. Instructions checklist

### Phase 3: Submissions
1. Submission form
2. File upload
3. Submission history
4. Feedback display

### Phase 4: Certificates
1. Certificate generation (backend)
2. Certificate display
3. Download functionality
4. Share buttons

### Phase 5: Settings & GDPR
1. Settings page
2. Data export
3. Account deletion
4. Consent management

## Design System

### Colors
- **DP Track**: Green theme (emerald-600)
- **FSD Track**: Blue theme (blue-600)
- **Discord**: Purple theme (purple-600)
- **Success**: Green (emerald-500)
- **Warning**: Orange (orange-500)
- **Error**: Red (red-500)

### Tool Card Design (from screenshot)
- Border: 2px solid with track color
- Background: Dark with slight transparency
- Icon: Left side, colored
- Title: Bold, white text
- Description: Smaller, gray text
- Button: Right side, "Open [Tool]", colored background
- Hover: Slight glow effect

### Status Badges
- **Not Started**: Gray
- **In Progress**: Blue with pulse animation
- **Submitted**: Yellow
- **Approved**: Green
- **Needs Revision**: Orange
- **Completed**: Green with checkmark

## File Structure

```
frontend/
├── app/
│   ├── student/
│   │   ├── dashboard/page.tsx ✅
│   │   ├── project/
│   │   │   └── [id]/
│   │   │       ├── page.tsx (project details)
│   │   │       └── start/page.tsx (project start)
│   │   ├── project-guide/page.tsx ⚠️ (exists, needs update)
│   │   ├── submit/page.tsx ⚠️ (exists, needs update)
│   │   ├── submissions/page.tsx ✅
│   │   ├── certificate/page.tsx ❌
│   │   └── settings/page.tsx ✅
│   └── get-started/page.tsx ✅
├── components/
│   └── student/
│       ├── tool-cards.tsx ❌
│       ├── tool-card.tsx ❌
│       ├── db-credentials.tsx ❌
│       ├── file-upload.tsx ❌
│       ├── submission-form.tsx ❌
│       ├── feedback-card.tsx ❌
│       └── certificate.tsx ❌
```

## Next Steps

1. **Immediate**: Build ToolCard component and add to dashboard
2. **Today**: Create project start page with credentials
3. **This Week**: Build submission workflow
4. **Next Week**: Certificate generation
5. **Following Week**: Settings and GDPR features

---

This plan ensures we build exactly what's described in the architecture document, with proper UI/UX matching the screenshot provided.
