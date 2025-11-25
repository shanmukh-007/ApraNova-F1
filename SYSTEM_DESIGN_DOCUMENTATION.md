# ApraNova Learning Management System - Complete System Design Documentation

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Overview](#system-overview)
3. [Architecture](#architecture)
4. [Technology Stack](#technology-stack)
5. [Core Modules](#core-modules)
6. [Data Models](#data-models)
7. [API Design](#api-design)
8. [Security Architecture](#security-architecture)
9. [Infrastructure](#infrastructure)
10. [Integration Points](#integration-points)
11. [Deployment Architecture](#deployment-architecture)
12. [Scalability & Performance](#scalability--performance)
13. [Monitoring & Logging](#monitoring--logging)
14. [Future Enhancements](#future-enhancements)

---

## 1. Executive Summary

### 1.1 Project Overview

**ApraNova** is a comprehensive Learning Management System (LMS) designed for technical education, specifically targeting two learning tracks:
- **Data Professional (DP)** - Data analytics and visualization
- **Full Stack Development (FSD)** - Web application development

### 1.2 Key Features

- ✅ Multi-role user management (Student, Trainer, Admin, SuperAdmin)
- ✅ Track-based curriculum with projects and deliverables
- ✅ Docker-based workspace provisioning (Superset for DP, VS Code for FSD)
- ✅ AI-powered quiz generation using Google Gemini
- ✅ GitHub integration for project management
- ✅ Payment processing via Stripe
- ✅ Real-time notifications via Slack
- ✅ JWT-based authentication with OAuth support
- ✅ Responsive modern UI with Next.js

### 1.3 System Metrics

- **Users**: Supports 1000+ concurrent users
- **Workspaces**: Isolated Docker containers per student
- **Projects**: 10 projects per track with multi-step workflows
- **Quizzes**: AI-generated with unlimited questions
- **Response Time**: < 500ms for API calls
- **Uptime**: 99.9% availability target


---

## 2. System Overview

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │   Browser    │  │   Mobile     │  │   Desktop    │                  │
│  │   (Chrome,   │  │   (Future)   │  │   (Future)   │                  │
│  │   Firefox)   │  │              │  │              │                  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                  │
│         │                 │                 │                            │
│         └─────────────────┴─────────────────┘                            │
│                           │                                               │
└───────────────────────────┼───────────────────────────────────────────────┘
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Next.js Frontend (Port 3000)                  │   │
│  │  - Server-Side Rendering (SSR)                                   │   │
│  │  - Client-Side Routing                                           │   │
│  │  - React 19 Components                                           │   │
│  │  - Tailwind CSS + Radix UI                                       │   │
│  │  - JWT Token Management                                          │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                           │
└───────────────────────────┬───────────────────────────────────────────────┘
                            │ REST API (JSON)
                            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       APPLICATION LAYER                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │              Django REST Framework (Port 8000)                   │   │
│  │                                                                   │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │   │
│  │  │ Accounts │  │Curriculum│  │  Quizzes │  │ Payments │       │   │
│  │  │  Module  │  │  Module  │  │  Module  │  │  Module  │       │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │   │
│  │                                                                   │   │
│  │  - JWT Authentication                                            │   │
│  │  - Role-Based Access Control (RBAC)                             │   │
│  │  - RESTful API Endpoints                                         │   │
│  │  - Business Logic Layer                                          │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                           │
└───────────────────────────┬───────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │  PostgreSQL  │  │    Redis     │  │   Docker     │                  │
│  │  (Port 5433) │  │  (Port 6380) │  │   Engine     │                  │
│  │              │  │              │  │              │                  │
│  │  - User Data │  │  - Sessions  │  │  - Workspaces│                  │
│  │  - Projects  │  │  - Cache     │  │  - Containers│                  │
│  │  - Quizzes   │  │  - Tokens    │  │              │                  │
│  └──────────────┘  └──────────────┘  └──────────────┘                  │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES LAYER                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │   Google     │  │    GitHub    │  │    Stripe    │                  │
│  │   Gemini AI  │  │     API      │  │   Payments   │                  │
│  └──────────────┘  └──────────────┘  └──────────────┘                  │
│                                                                           │
│  ┌──────────────┐  ┌──────────────┐                                     │
│  │    Slack     │  │    Email     │                                     │
│  │Notifications │  │   Service    │                                     │
│  └──────────────┘  └──────────────┘                                     │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 System Components

| Component | Technology | Purpose | Port |
|-----------|-----------|---------|------|
| **Frontend** | Next.js 15 + React 19 | User interface | 3000 |
| **Backend API** | Django 5.2.7 + DRF | Business logic | 8000 |
| **Database** | PostgreSQL 14 | Data persistence | 5433 |
| **Cache** | Redis 7 | Session & caching | 6380 |
| **Superset** | Apache Superset | Data analytics (DP) | 8088 |
| **Code Server** | VS Code Server | IDE (FSD) | 8080 |
| **Reverse Proxy** | Nginx | Load balancing | 80/443 |


---

## 3. Architecture

### 3.1 Architectural Pattern

**Microservices-Ready Monolith with Service-Oriented Design**

The system follows a modular monolithic architecture that can be easily decomposed into microservices:

```
┌─────────────────────────────────────────────────────────────┐
│                    ApraNova Platform                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────────────────────────────────────────┐     │
│  │           Authentication & Authorization            │     │
│  │  - JWT Token Management                             │     │
│  │  - OAuth 2.0 (Google, GitHub)                       │     │
│  │  - Role-Based Access Control                        │     │
│  └────────────────────────────────────────────────────┘     │
│                          │                                    │
│         ┌────────────────┼────────────────┐                 │
│         │                │                │                  │
│         ▼                ▼                ▼                  │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐             │
│  │ Accounts │    │Curriculum│    │ Quizzes  │             │
│  │ Service  │    │ Service  │    │ Service  │             │
│  │          │    │          │    │          │             │
│  │ - Users  │    │ - Tracks │    │ - AI Gen │             │
│  │ - Roles  │    │ - Projects│   │ - Attempts│            │
│  │ - OAuth  │    │ - Steps  │    │ - Grading│             │
│  │ - Workspace│  │ - Progress│   │          │             │
│  └──────────┘    └──────────┘    └──────────┘             │
│         │                │                │                  │
│         └────────────────┼────────────────┘                 │
│                          │                                    │
│                          ▼                                    │
│  ┌────────────────────────────────────────────────────┐     │
│  │              Shared Data Layer                      │     │
│  │  - PostgreSQL Database                              │     │
│  │  - Redis Cache                                      │     │
│  │  - File Storage                                     │     │
│  └────────────────────────────────────────────────────┘     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Design Principles

1. **Separation of Concerns**: Each module handles specific domain logic
2. **DRY (Don't Repeat Yourself)**: Shared utilities and base classes
3. **SOLID Principles**: Clean, maintainable code structure
4. **API-First Design**: RESTful API with clear contracts
5. **Security by Default**: Authentication required for all endpoints
6. **Scalability**: Stateless design for horizontal scaling

### 3.3 Request Flow

```
┌─────────┐
│ Client  │
└────┬────┘
     │ 1. HTTP Request (with JWT)
     ▼
┌──────────────┐
│   Next.js    │
│   Frontend   │
└──────┬───────┘
       │ 2. API Call
       ▼
┌──────────────┐
│    Nginx     │ (Production)
│ Load Balancer│
└──────┬───────┘
       │ 3. Route to Backend
       ▼
┌──────────────┐
│   Django     │
│ Middleware   │
└──────┬───────┘
       │ 4. Verify JWT
       ▼
┌──────────────┐
│ Authentication│
│   Layer      │
└──────┬───────┘
       │ 5. Check Permissions
       ▼
┌──────────────┐
│   View       │
│  (Endpoint)  │
└──────┬───────┘
       │ 6. Business Logic
       ▼
┌──────────────┐
│  Serializer  │
│ (Validation) │
└──────┬───────┘
       │ 7. Database Query
       ▼
┌──────────────┐
│  PostgreSQL  │
│   Database   │
└──────┬───────┘
       │ 8. Return Data
       ▼
┌──────────────┐
│   Response   │
│    (JSON)    │
└──────┬───────┘
       │ 9. Send to Client
       ▼
┌──────────────┐
│   Client     │
│   Renders    │
└──────────────┘
```

### 3.4 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Data Flow Layers                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────────────────────────────────────────┐     │
│  │  1. Presentation Layer (Frontend)                   │     │
│  │     - React Components                              │     │
│  │     - State Management (React Hooks)                │     │
│  │     - API Client (Axios)                            │     │
│  └────────────────────────────────────────────────────┘     │
│                          │                                    │
│                          ▼                                    │
│  ┌────────────────────────────────────────────────────┐     │
│  │  2. API Layer (REST Endpoints)                      │     │
│  │     - URL Routing                                   │     │
│  │     - Request Validation                            │     │
│  │     - Response Formatting                           │     │
│  └────────────────────────────────────────────────────┘     │
│                          │                                    │
│                          ▼                                    │
│  ┌────────────────────────────────────────────────────┐     │
│  │  3. Business Logic Layer (Views)                    │     │
│  │     - Authentication & Authorization                │     │
│  │     - Business Rules                                │     │
│  │     - Data Processing                               │     │
│  └────────────────────────────────────────────────────┘     │
│                          │                                    │
│                          ▼                                    │
│  ┌────────────────────────────────────────────────────┐     │
│  │  4. Data Access Layer (Models/ORM)                  │     │
│  │     - Django ORM                                    │     │
│  │     - Query Optimization                            │     │
│  │     - Relationships                                 │     │
│  └────────────────────────────────────────────────────┘     │
│                          │                                    │
│                          ▼                                    │
│  ┌────────────────────────────────────────────────────┐     │
│  │  5. Persistence Layer (Database)                    │     │
│  │     - PostgreSQL                                    │     │
│  │     - Transactions                                  │     │
│  │     - Indexes                                       │     │
│  └────────────────────────────────────────────────────┘     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```


---

## 4. Technology Stack

### 4.1 Backend Technologies

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Python** | 3.11+ | Programming language |
| **Django** | 5.2.7 | Web framework |
| **Django REST Framework** | 3.16.1 | API framework |
| **PostgreSQL** | 14 | Primary database |
| **Redis** | 7 | Caching & sessions |
| **Celery** | (Future) | Async tasks |
| **Docker** | 20.10+ | Containerization |

**Key Python Packages:**
```python
# Core Framework
Django==5.2.7
djangorestframework==3.16.1
django-cors-headers==4.7.0

# Authentication
djangorestframework-simplejwt==5.4.1
dj-rest-auth==7.0.0
django-allauth==65.4.0

# Database
psycopg2-binary==2.9.10
dj-database-url==2.3.0

# External Services
stripe==12.2.0
google-generativeai==0.8.5
requests==2.32.3

# Utilities
python-decouple==3.8
whitenoise==6.9.0
```

### 4.2 Frontend Technologies

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | 18+ | Runtime environment |
| **Next.js** | 15.2.4 | React framework |
| **React** | 19 | UI library |
| **TypeScript** | 5.9.3 | Type safety |
| **Tailwind CSS** | 4.1.9 | Styling |
| **Radix UI** | Latest | Component library |

**Key NPM Packages:**
```json
{
  "dependencies": {
    "next": "15.2.4",
    "react": "^19",
    "react-dom": "^19",
    "typescript": "^5.9.3",
    "axios": "^1.12.2",
    "tailwindcss": "^4.1.9",
    "@radix-ui/react-*": "latest",
    "lucide-react": "^0.454.0",
    "react-hook-form": "latest",
    "zod": "3.25.76"
  }
}
```

### 4.3 Infrastructure Technologies

| Technology | Purpose |
|-----------|---------|
| **Docker** | Container runtime |
| **Docker Compose** | Multi-container orchestration |
| **Nginx** | Reverse proxy & load balancer |
| **Apache Superset** | Data analytics platform |
| **Code Server** | Browser-based VS Code |
| **GitHub Actions** | CI/CD pipeline |
| **AWS/Cloud** | Production hosting |

### 4.4 External Services

| Service | Purpose | Integration |
|---------|---------|-------------|
| **Google Gemini AI** | Quiz generation | REST API |
| **GitHub API** | Repository management | OAuth + REST |
| **Stripe** | Payment processing | SDK + Webhooks |
| **Slack** | Notifications | Webhooks |
| **Email Service** | User notifications | SMTP |

### 4.5 Development Tools

| Tool | Purpose |
|------|---------|
| **Git** | Version control |
| **VS Code** | IDE |
| **Postman** | API testing |
| **pgAdmin** | Database management |
| **Redis Commander** | Cache management |
| **Docker Desktop** | Container management |


---

## 5. Core Modules

### 5.1 Accounts Module

**Purpose**: User management, authentication, and workspace provisioning

```
accounts/
├── models.py           # CustomUser model
├── serializers.py      # User data serialization
├── views.py            # User CRUD operations
├── oauth_views.py      # OAuth authentication
├── github_views.py     # GitHub integration
├── workspace_views.py  # Workspace provisioning
└── urls.py             # URL routing
```

**Key Features:**
- ✅ Custom user model with role-based access
- ✅ JWT authentication with refresh tokens
- ✅ OAuth 2.0 (Google, GitHub)
- ✅ Email verification
- ✅ Password reset
- ✅ Trainer-student assignment (max 20 students per trainer)
- ✅ Docker workspace provisioning
- ✅ GitHub account linking

**User Roles:**
```python
ROLE_CHOICES = [
    ("student", "Student"),      # Can take courses, quizzes
    ("trainer", "Trainer"),      # Can create quizzes, review submissions
    ("admin", "Admin"),          # Can manage users, content
    ("superadmin", "SuperAdmin") # Full system access
]
```

**Workspace Provisioning Flow:**
```
Student → Click "Launch Workspace"
    ↓
Backend checks user.track
    ↓
    ├─ DP Track → Provision Superset container (Port 8088)
    └─ FSD Track → Provision VS Code container (Port 8080)
    ↓
Return workspace URL to frontend
    ↓
Open workspace in new tab
```

### 5.2 Curriculum Module

**Purpose**: Track, project, and progress management

```
curriculum/
├── models.py              # Track, Project, Step, Progress models
├── serializers.py         # Data serialization
├── views.py               # CRUD operations
├── github_integration.py  # GitHub repo creation
├── webhook_views.py       # GitHub webhooks
└── urls.py                # URL routing
```

**Key Features:**
- ✅ Two learning tracks (DP, FSD)
- ✅ 10 projects per track
- ✅ Multi-step project workflows
- ✅ Deliverable tracking
- ✅ Student progress monitoring
- ✅ GitHub repository auto-creation
- ✅ Pull request tracking
- ✅ Submission review system

**Data Models:**
```
Track (DP, FSD)
  └── Project (1-10)
       ├── ProjectStep (workflow steps)
       ├── Deliverable (expected outputs)
       └── StudentProgress (tracking)
            └── Submission (student work)
```

**Project Types:**
- **Internal**: Practice projects within platform
- **Capstone**: External cloud deployment projects

### 5.3 Quizzes Module

**Purpose**: AI-powered quiz generation and assessment

```
quizzes/
├── models.py        # Quiz, Question, Answer, Attempt models
├── serializers.py   # Data serialization
├── views.py         # Quiz CRUD and taking logic
├── ai_service.py    # Google Gemini integration
└── urls.py          # URL routing
```

**Key Features:**
- ✅ AI quiz generation (Google Gemini)
- ✅ Two generation modes: Prompt-based, Web search
- ✅ Single & multiple choice questions
- ✅ Auto-grading
- ✅ Progress tracking
- ✅ Results with detailed feedback
- ✅ Quiz attempt history

**Quiz Generation Flow:**
```
Trainer → Enter prompt/topic
    ↓
Backend → Call Google Gemini API
    ↓
Gemini → Generate questions in JSON format
    ↓
Backend → Parse and save to database
    ↓
Quiz available for students
```

**Quiz Taking Flow:**
```
Student → Start quiz
    ↓
Create QuizAttempt (status: IN_PROGRESS)
    ↓
Student answers questions
    ↓
Auto-save each answer
    ↓
Student submits quiz
    ↓
Calculate score
    ↓
Show results with correct/incorrect answers
```

### 5.4 Payments Module

**Purpose**: Stripe payment integration

```
payments/
├── models.py      # Payment model
├── views.py       # Payment processing
└── urls.py        # URL routing
```

**Key Features:**
- ✅ Stripe integration
- ✅ Payment intent creation
- ✅ Payment status tracking
- ✅ Transaction history
- ✅ Webhook handling (future)

**Payment Flow:**
```
Student → Select course/plan
    ↓
Frontend → Create payment intent
    ↓
Stripe → Process payment
    ↓
Backend → Update payment status
    ↓
Grant access to content
```

### 5.5 Core Module

**Purpose**: Django settings and shared utilities

```
core/
├── settings.py      # Django configuration
├── urls.py          # Root URL routing
├── wsgi.py          # WSGI application
└── report_utils.py  # Reporting utilities
```

**Key Configurations:**
- Database connection (PostgreSQL)
- Redis cache setup
- CORS settings
- JWT configuration
- Email settings
- Static/media file handling
- Security settings


---

## 6. Data Models

### 6.1 Entity Relationship Diagram

```
┌─────────────────┐
│   CustomUser    │
├─────────────────┤
│ id (PK)         │
│ email (unique)  │
│ username        │
│ role            │◄────────────┐
│ track           │             │
│ name            │             │
│ assigned_trainer│─────┐       │
│ github_username │     │       │
│ github_token    │     │       │
│ created_at      │     │       │
└────────┬────────┘     │       │
         │              │       │
         │              │       │
    ┌────┴────┐    ┌────▼────┐  │
    │         │    │         │  │
    ▼         ▼    ▼         │  │
┌─────────┐ ┌──────────┐    │  │
│  Quiz   │ │StudentPro│    │  │
│         │ │  gress   │    │  │
├─────────┤ ├──────────┤    │  │
│ id (PK) │ │ id (PK)  │    │  │
│ title   │ │ student  │────┘  │
│ created │ │ project  │───┐   │
│  _by    │─┘ step     │   │   │
│ prompt  │  completed │   │   │
│ type    │  github_   │   │   │
└────┬────┘   repo     │   │   │
     │      └──────────┘   │   │
     │                     │   │
     ▼                     │   │
┌──────────┐               │   │
│ Question │               │   │
├──────────┤               │   │
│ id (PK)  │               │   │
│ quiz_id  │───────────────┘   │
│ text     │                   │
│ type     │                   │
│ order    │                   │
└────┬─────┘                   │
     │                         │
     ▼                         │
┌──────────┐                   │
│  Answer  │                   │
├──────────┤                   │
│ id (PK)  │                   │
│ question │───────────────────┘
│ text     │
│ correct  │
└──────────┘

┌──────────┐      ┌──────────┐
│  Track   │      │ Project  │
├──────────┤      ├──────────┤
│ id (PK)  │      │ id (PK)  │
│ code     │◄─────│ track_id │
│ name     │      │ number   │
│ duration │      │ title    │
└──────────┘      │ type     │
                  │ github_  │
                  │  template│
                  └────┬─────┘
                       │
                  ┌────┴─────┐
                  │          │
                  ▼          ▼
            ┌──────────┐ ┌──────────┐
            │ProjectSte│ │Deliverable│
            │    p     │ │          │
            ├──────────┤ ├──────────┤
            │ id (PK)  │ │ id (PK)  │
            │ project  │ │ project  │
            │ number   │ │ title    │
            │ title    │ │ type     │
            │ desc     │ │ required │
            └──────────┘ └────┬─────┘
                              │
                              ▼
                        ┌──────────┐
                        │Submission│
                        ├──────────┤
                        │ id (PK)  │
                        │ student  │
                        │ deliver  │
                        │ url/file │
                        │ status   │
                        │ feedback │
                        └──────────┘

┌──────────┐
│ Payment  │
├──────────┤
│ id (PK)  │
│ user_id  │───────┐
│ stripe_  │       │
│  intent  │       │
│ amount   │       │
│ status   │       │
└──────────┘       │
                   │
                   ▼
            ┌──────────┐
            │QuizAttemp│
            │    t     │
            ├──────────┤
            │ id (PK)  │
            │ student  │
            │ quiz_id  │
            │ status   │
            │ score    │
            │ started  │
            │ submitted│
            └────┬─────┘
                 │
                 ▼
            ┌──────────┐
            │StudentAns│
            │   wer    │
            ├──────────┤
            │ id (PK)  │
            │ attempt  │
            │ question │
            │ selected │
            │  answers │
            │ correct  │
            └──────────┘
```

### 6.2 Core Models

#### CustomUser Model
```python
class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    track = models.CharField(max_length=50, blank=True)
    name = models.CharField(max_length=150, blank=True)
    assigned_trainer = models.ForeignKey('self', null=True)
    github_username = models.CharField(max_length=100)
    github_access_token = models.CharField(max_length=255)
    github_connected = models.BooleanField(default=False)
```

**Relationships:**
- One-to-Many: User → Quizzes (created_by)
- One-to-Many: User → QuizAttempts (student)
- One-to-Many: User → StudentProgress
- One-to-Many: User → Submissions
- One-to-Many: Trainer → Students (assigned_trainer)

#### Track & Project Models
```python
class Track(models.Model):
    code = models.CharField(max_length=10, unique=True)  # DP, FSD
    name = models.CharField(max_length=100)
    description = models.TextField()
    duration_weeks = models.IntegerField(default=12)

class Project(models.Model):
    track = models.ForeignKey(Track)
    number = models.IntegerField()  # 1-10
    title = models.CharField(max_length=200)
    project_type = models.CharField(max_length=20)  # INTERNAL, CAPSTONE
    tech_stack = models.JSONField(default=list)
    github_template_repo = models.CharField(max_length=200)
```

#### Quiz Models
```python
class Quiz(models.Model):
    title = models.CharField(max_length=200)
    created_by = models.ForeignKey(CustomUser)
    generation_type = models.CharField(max_length=20)  # PROMPT, WEB_SEARCH
    prompt = models.TextField()
    is_active = models.BooleanField(default=True)

class Question(models.Model):
    quiz = models.ForeignKey(Quiz)
    question_text = models.TextField()
    question_type = models.CharField(max_length=20)  # SINGLE, MULTIPLE
    order = models.IntegerField()

class Answer(models.Model):
    question = models.ForeignKey(Question)
    answer_text = models.TextField()
    is_correct = models.BooleanField(default=False)
```

### 6.3 Database Indexes

**Performance Optimization:**
```sql
-- User lookups
CREATE INDEX idx_user_email ON accounts_customuser(email);
CREATE INDEX idx_user_role ON accounts_customuser(role);
CREATE INDEX idx_user_track ON accounts_customuser(track);

-- Quiz queries
CREATE INDEX idx_quiz_created_by ON quizzes_quiz(created_by_id);
CREATE INDEX idx_quiz_active ON quizzes_quiz(is_active);

-- Progress tracking
CREATE INDEX idx_progress_student ON curriculum_studentprogress(student_id);
CREATE INDEX idx_progress_project ON curriculum_studentprogress(project_id);

-- Submissions
CREATE INDEX idx_submission_student ON curriculum_submission(student_id);
CREATE INDEX idx_submission_status ON curriculum_submission(status);
```


---

## 7. API Design

### 7.1 API Architecture

**RESTful API Design Principles:**
- Resource-based URLs
- HTTP methods for CRUD operations
- JSON request/response format
- JWT authentication
- Consistent error handling
- Pagination for list endpoints
- Filtering and search capabilities

### 7.2 API Endpoints

#### Authentication Endpoints

```
POST   /api/auth/register/           # User registration
POST   /api/auth/login/               # User login
POST   /api/auth/logout/              # User logout
POST   /api/auth/token/refresh/       # Refresh JWT token
POST   /api/auth/password/reset/      # Password reset request
POST   /api/auth/password/reset/confirm/  # Confirm password reset
GET    /api/auth/verify-email/{key}/  # Email verification
```

**Example: Login Request**
```json
POST /api/auth/login/
{
  "email": "student@example.com",
  "password": "SecurePass123"
}

Response:
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "email": "student@example.com",
    "role": "student",
    "track": "FSD",
    "name": "John Doe"
  }
}
```

#### User Management Endpoints

```
GET    /api/users/profile/            # Get current user profile
PUT    /api/users/profile/            # Update profile
GET    /api/users/                    # List users (admin only)
GET    /api/users/{id}/               # Get user details
PUT    /api/users/{id}/               # Update user (admin)
DELETE /api/users/{id}/               # Delete user (admin)
GET    /api/users/trainers/           # List available trainers
POST   /api/users/assign-trainer/     # Assign trainer to student
```

#### Workspace Endpoints

```
POST   /api/users/workspace/create/   # Create/start workspace
GET    /api/users/workspace/status/   # Get workspace status
DELETE /api/users/workspace/stop/     # Stop workspace
GET    /api/users/workspace/url/      # Get workspace URL
```

**Example: Create Workspace**
```json
POST /api/users/workspace/create/
Headers: Authorization: Bearer <token>

Response:
{
  "url": "http://localhost:8088",
  "workspace_type": "superset",
  "status": "running",
  "container_id": "abc123def456"
}
```

#### Curriculum Endpoints

```
GET    /api/curriculum/tracks/        # List all tracks
GET    /api/curriculum/tracks/{code}/ # Get track details
GET    /api/curriculum/projects/      # List projects
GET    /api/curriculum/projects/{id}/ # Get project details
GET    /api/curriculum/projects/{id}/steps/  # Get project steps
POST   /api/curriculum/progress/      # Update progress
GET    /api/curriculum/progress/me/   # Get my progress
```

**Example: Get Track Details**
```json
GET /api/curriculum/tracks/FSD/

Response:
{
  "code": "FSD",
  "name": "Full-Stack Developer",
  "description": "Learn to build complete web applications",
  "duration_weeks": 12,
  "projects": [
    {
      "id": 1,
      "number": 1,
      "title": "Portfolio Website",
      "type": "INTERNAL",
      "tech_stack": ["HTML", "CSS", "JavaScript"],
      "steps_count": 5
    }
  ]
}
```

#### Quiz Endpoints

```
POST   /api/quiz/quizzes/generate/    # Generate quiz with AI
GET    /api/quiz/quizzes/             # List quizzes
GET    /api/quiz/quizzes/{id}/        # Get quiz details
DELETE /api/quiz/quizzes/{id}/        # Delete quiz (trainer)
POST   /api/quiz/quizzes/{id}/start/  # Start quiz attempt
POST   /api/quiz/attempts/{id}/answer/  # Submit answer
POST   /api/quiz/attempts/{id}/submit/  # Submit quiz
GET    /api/quiz/attempts/{id}/        # Get attempt results
GET    /api/quiz/attempts/             # List my attempts
```

**Example: Generate Quiz**
```json
POST /api/quiz/quizzes/generate/
{
  "title": "Python Basics",
  "prompt": "Python functions and loops",
  "generation_type": "PROMPT",
  "num_questions": 5
}

Response:
{
  "id": 1,
  "title": "Python Basics",
  "created_by": {
    "id": 2,
    "name": "Trainer Name"
  },
  "questions": [
    {
      "id": 1,
      "question_text": "What is a function in Python?",
      "question_type": "SINGLE",
      "answers": [
        {
          "id": 1,
          "answer_text": "A reusable block of code",
          "is_correct": true
        },
        {
          "id": 2,
          "answer_text": "A variable",
          "is_correct": false
        }
      ]
    }
  ],
  "created_at": "2024-01-01T12:00:00Z"
}
```

#### Submission Endpoints

```
POST   /api/curriculum/submissions/   # Create submission
GET    /api/curriculum/submissions/   # List submissions
GET    /api/curriculum/submissions/{id}/  # Get submission
PUT    /api/curriculum/submissions/{id}/  # Update submission
POST   /api/curriculum/submissions/{id}/review/  # Review submission (trainer)
```

#### Payment Endpoints

```
POST   /api/payments/create-intent/   # Create payment intent
GET    /api/payments/                 # List payments
GET    /api/payments/{id}/            # Get payment details
POST   /api/payments/webhook/         # Stripe webhook
```

### 7.3 API Response Format

**Success Response:**
```json
{
  "status": "success",
  "data": {
    // Response data
  },
  "message": "Operation successful"
}
```

**Error Response:**
```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "email": ["This field is required"]
    }
  }
}
```

**Pagination Response:**
```json
{
  "count": 100,
  "next": "http://api.example.com/users/?page=2",
  "previous": null,
  "results": [
    // Array of items
  ]
}
```

### 7.4 API Authentication

**JWT Token Flow:**
```
1. User logs in → Receives access + refresh tokens
2. Store tokens in localStorage/cookies
3. Include access token in all requests:
   Authorization: Bearer <access_token>
4. When access token expires (15 min):
   - Use refresh token to get new access token
5. When refresh token expires (7 days):
   - User must log in again
```

**Token Structure:**
```json
{
  "token_type": "Bearer",
  "exp": 1640995200,
  "iat": 1640991600,
  "jti": "abc123",
  "user_id": 1,
  "email": "user@example.com",
  "role": "student"
}
```

### 7.5 API Rate Limiting

**Rate Limits (Future Implementation):**
- Anonymous: 100 requests/hour
- Authenticated: 1000 requests/hour
- Admin: Unlimited

**Headers:**
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```


---

## 8. Security Architecture

### 8.1 Authentication & Authorization

```
┌─────────────────────────────────────────────────────────────┐
│                  Security Layers                             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Layer 1: Network Security                                   │
│  ┌────────────────────────────────────────────────────┐     │
│  │ - HTTPS/TLS encryption                             │     │
│  │ - CORS configuration                               │     │
│  │ - Firewall rules                                   │     │
│  └────────────────────────────────────────────────────┘     │
│                          │                                    │
│                          ▼                                    │
│  Layer 2: Authentication                                     │
│  ┌────────────────────────────────────────────────────┐     │
│  │ - JWT tokens (access + refresh)                    │     │
│  │ - OAuth 2.0 (Google, GitHub)                       │     │
│  │ - Password hashing (PBKDF2)                        │     │
│  │ - Email verification                               │     │
│  └────────────────────────────────────────────────────┘     │
│                          │                                    │
│                          ▼                                    │
│  Layer 3: Authorization                                      │
│  ┌────────────────────────────────────────────────────┐     │
│  │ - Role-Based Access Control (RBAC)                 │     │
│  │ - Permission checks                                │     │
│  │ - Resource ownership validation                    │     │
│  └────────────────────────────────────────────────────┘     │
│                          │                                    │
│                          ▼                                    │
│  Layer 4: Data Security                                      │
│  ┌────────────────────────────────────────────────────┐     │
│  │ - Input validation                                 │     │
│  │ - SQL injection prevention (ORM)                   │     │
│  │ - XSS protection                                   │     │
│  │ - CSRF tokens                                      │     │
│  └────────────────────────────────────────────────────┘     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### 8.2 JWT Token Security

**Token Configuration:**
```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
}
```

**Token Blacklisting:**
- Refresh tokens are blacklisted after rotation
- Logout invalidates all user tokens
- Expired tokens automatically rejected

### 8.3 Role-Based Access Control

**Permission Matrix:**

| Resource | Student | Trainer | Admin | SuperAdmin |
|----------|---------|---------|-------|------------|
| **Users** |
| View own profile | ✅ | ✅ | ✅ | ✅ |
| Edit own profile | ✅ | ✅ | ✅ | ✅ |
| View all users | ❌ | ❌ | ✅ | ✅ |
| Edit any user | ❌ | ❌ | ✅ | ✅ |
| Delete user | ❌ | ❌ | ❌ | ✅ |
| **Quizzes** |
| View quizzes | ✅ | ✅ | ✅ | ✅ |
| Take quizzes | ✅ | ✅ | ✅ | ✅ |
| Generate quizzes | ❌ | ✅ | ✅ | ✅ |
| Delete quizzes | ❌ | ✅ (own) | ✅ | ✅ |
| **Projects** |
| View projects | ✅ | ✅ | ✅ | ✅ |
| Submit work | ✅ | ❌ | ❌ | ✅ |
| Review submissions | ❌ | ✅ | ✅ | ✅ |
| Create projects | ❌ | ❌ | ✅ | ✅ |
| **Workspace** |
| Launch workspace | ✅ | ✅ | ✅ | ✅ |
| Manage workspaces | ❌ | ❌ | ✅ | ✅ |

**Implementation:**
```python
# View-level permission check
class QuizGenerateView(APIView):
    permission_classes = [IsAuthenticated, IsTrainerOrAdmin]
    
    def post(self, request):
        # Only trainers and admins can generate quizzes
        pass

# Object-level permission check
class QuizDeleteView(APIView):
    def delete(self, request, pk):
        quiz = Quiz.objects.get(pk=pk)
        if request.user.role == 'trainer':
            # Trainers can only delete their own quizzes
            if quiz.created_by != request.user:
                return Response(status=403)
        # Admins can delete any quiz
        quiz.delete()
```

### 8.4 Data Protection

**Password Security:**
```python
# Django's PBKDF2 algorithm with SHA256
AUTH_PASSWORD_VALIDATORS = [
    'UserAttributeSimilarityValidator',
    'MinimumLengthValidator',  # Min 8 characters
    'CommonPasswordValidator',
    'NumericPasswordValidator',
]
```

**Input Validation:**
```python
# Using Django REST Framework serializers
class UserSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        validators=[validate_password]
    )
```

**SQL Injection Prevention:**
```python
# Django ORM automatically escapes queries
User.objects.filter(email=user_input)  # Safe
# Never use raw SQL with user input
```

**XSS Protection:**
```python
# Django templates auto-escape HTML
{{ user_input }}  # Automatically escaped

# React also escapes by default
<div>{userInput}</div>  # Safe
```

### 8.5 API Security

**CORS Configuration:**
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://apranova.com",
]
CORS_ALLOW_CREDENTIALS = True
```

**CSRF Protection:**
```python
# CSRF tokens for state-changing operations
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "https://apranova.com",
]
```

**Rate Limiting (Future):**
```python
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
        'user': '1000/hour'
    }
}
```

### 8.6 Container Security

**Docker Security:**
```yaml
# Non-root user in containers
user: "1000:1000"

# Read-only root filesystem
read_only: true

# Limited capabilities
cap_drop:
  - ALL
cap_add:
  - NET_BIND_SERVICE

# Resource limits
deploy:
  resources:
    limits:
      cpus: '0.5'
      memory: 512M
```

**Workspace Isolation:**
- Each student gets isolated Docker container
- No shared volumes between workspaces
- Network isolation between containers
- Automatic cleanup of stopped containers

### 8.7 Production Security Checklist

**Pre-Deployment:**
- [ ] Change all default passwords
- [ ] Generate strong SECRET_KEY
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Set DEBUG=False
- [ ] Update ALLOWED_HOSTS
- [ ] Configure CORS properly
- [ ] Enable security headers
- [ ] Set up backup strategy
- [ ] Configure logging
- [ ] Enable monitoring
- [ ] Review all environment variables

**Security Headers:**
```python
# Production settings
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
```


---

## 9. Infrastructure

### 9.1 Docker Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Host Machine                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────────────────────────────────────────┐     │
│  │         Docker Network (apranova_network)          │     │
│  │                                                     │     │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐        │     │
│  │  │ Frontend │  │ Backend  │  │PostgreSQL│        │     │
│  │  │  :3000   │◄─┤  :8000   │◄─┤  :5433   │        │     │
│  │  └──────────┘  └────┬─────┘  └──────────┘        │     │
│  │                     │                              │     │
│  │                     ▼                              │     │
│  │              ┌──────────┐                          │     │
│  │              │  Redis   │                          │     │
│  │              │  :6380   │                          │     │
│  │              └──────────┘                          │     │
│  │                                                     │     │
│  │  ┌──────────┐  ┌──────────┐                       │     │
│  │  │ Superset │  │Code Server│                      │     │
│  │  │  :8088   │  │  :8080   │                       │     │
│  │  └──────────┘  └──────────┘                       │     │
│  │                                                     │     │
│  │  ┌─────────────────────────────────────────┐      │     │
│  │  │   Dynamic Student Workspaces            │      │     │
│  │  │  (Created on-demand)                    │      │     │
│  │  │                                          │      │     │
│  │  │  workspace_1  workspace_2  workspace_3  │      │     │
│  │  │    :8089         :8090         :8091    │      │     │
│  │  └─────────────────────────────────────────┘      │     │
│  │                                                     │     │
│  └────────────────────────────────────────────────────┘     │
│                                                               │
│  ┌────────────────────────────────────────────────────┐     │
│  │              Docker Volumes                         │     │
│  │                                                     │     │
│  │  postgres_data  redis_data  static_volume          │     │
│  │  media_volume   superset_home  code_server_data    │     │
│  └────────────────────────────────────────────────────┘     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### 9.2 Container Specifications

**Backend Container:**
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["gunicorn", "core.wsgi:application", "--bind", "0.0.0.0:8000"]
```

**Frontend Container:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

**Resource Limits:**
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### 9.3 Volume Management

**Persistent Volumes:**
```yaml
volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
  static_volume:
    driver: local
  media_volume:
    driver: local
  superset_home:
    driver: local
  code_server_data:
    driver: local
```

**Volume Backup Strategy:**
```bash
# Backup PostgreSQL
docker exec apranova_db pg_dump -U user db > backup.sql

# Backup volumes
docker run --rm -v postgres_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/postgres-backup.tar.gz /data
```

### 9.4 Network Configuration

**Docker Network:**
```yaml
networks:
  apranova_network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

**Service Communication:**
- Frontend → Backend: HTTP (internal network)
- Backend → Database: PostgreSQL protocol
- Backend → Redis: Redis protocol
- Backend → Docker: Unix socket (/var/run/docker.sock)

### 9.5 Health Checks

**Backend Health Check:**
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

**Database Health Check:**
```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
  interval: 10s
  timeout: 5s
  retries: 5
```

**Frontend Health Check:**
```yaml
healthcheck:
  test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/api/health')"]
  interval: 30s
  timeout: 10s
  retries: 3
```

### 9.6 Environment Configuration

**.env File Structure:**
```env
# Application
PROJECT_NAME=ApraNova
DEBUG=False
SECRET_KEY=your-secret-key-here

# Database
POSTGRES_DB=apranova_db
POSTGRES_USER=apranova_user
POSTGRES_PASSWORD=secure_password
DATABASE_URL=postgresql://user:pass@db:5432/apranova_db

# Redis
REDIS_PASSWORD=redis_password
REDIS_URL=redis://:password@redis:6379/0

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000

# External Services
GOOGLE_GEMINI_API_KEY=your-api-key
GITHUB_CLIENT_ID=your-client-id
GITHUB_CLIENT_SECRET=your-client-secret
STRIPE_SECRET_KEY=your-stripe-key
SLACK_WEBHOOK_URL=your-slack-webhook

# Workspace
CODE_SERVER_PASSWORD=password123
SUPERSET_SECRET_KEY=superset-secret-key
```


---

## 10. Integration Points

### 10.1 Google Gemini AI Integration

**Purpose**: AI-powered quiz generation

**Flow:**
```
Trainer → Enter prompt
    ↓
Backend → Call Gemini API
    ↓
Gemini → Generate questions (JSON)
    ↓
Backend → Parse and save to DB
    ↓
Quiz available for students
```

**API Implementation:**
```python
import google.generativeai as genai

def generate_quiz_from_prompt(prompt, num_questions=5):
    genai.configure(api_key=settings.GOOGLE_GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-pro')
    
    system_prompt = f"""
    Generate {num_questions} multiple choice questions about: {prompt}
    Return JSON format:
    {{
      "questions": [
        {{
          "question": "Question text",
          "type": "single",
          "answers": [
            {{"text": "Answer 1", "correct": true}},
            {{"text": "Answer 2", "correct": false}}
          ]
        }}
      ]
    }}
    """
    
    response = model.generate_content(system_prompt)
    return json.loads(response.text)
```

**Rate Limits:**
- Free tier: 60 requests/minute
- Paid tier: Higher limits
- Implement caching for repeated prompts

### 10.2 GitHub Integration

**Purpose**: Repository management and project tracking

**Features:**
1. **OAuth Authentication**
2. **Repository Creation**
3. **Pull Request Tracking**
4. **Webhook Integration**

**OAuth Flow:**
```
Student → Click "Connect GitHub"
    ↓
Redirect to GitHub OAuth
    ↓
User authorizes
    ↓
GitHub → Callback with code
    ↓
Backend → Exchange code for token
    ↓
Store token in user profile
```

**Repository Creation:**
```python
def create_student_repo(user, project):
    headers = {
        'Authorization': f'token {user.github_access_token}',
        'Accept': 'application/vnd.github.v3+json'
    }
    
    # Create repo from template
    data = {
        'name': f'{project.title.lower().replace(" ", "-")}',
        'description': project.description,
        'private': False
    }
    
    response = requests.post(
        f'https://api.github.com/repos/{template_repo}/generate',
        headers=headers,
        json=data
    )
    
    return response.json()['html_url']
```

**Webhook Handling:**
```python
@csrf_exempt
def github_webhook(request):
    event = request.headers.get('X-GitHub-Event')
    
    if event == 'pull_request':
        data = json.loads(request.body)
        action = data['action']
        pr_number = data['number']
        repo_url = data['repository']['html_url']
        
        # Update submission status
        submission = Submission.objects.get(
            github_pr_number=pr_number
        )
        
        if action == 'opened':
            submission.status = 'PENDING'
        elif action == 'closed' and data['pull_request']['merged']:
            submission.status = 'APPROVED'
        
        submission.save()
        
        # Send Slack notification
        send_slack_notification(f"PR #{pr_number} {action}")
    
    return JsonResponse({'status': 'ok'})
```

### 10.3 Stripe Payment Integration

**Purpose**: Payment processing for course enrollment

**Payment Flow:**
```
Student → Select plan
    ↓
Frontend → Create payment intent
    ↓
Stripe → Return client secret
    ↓
Frontend → Show payment form
    ↓
Student → Enter card details
    ↓
Stripe → Process payment
    ↓
Webhook → Notify backend
    ↓
Backend → Grant access
```

**Implementation:**
```python
import stripe

def create_payment_intent(user, amount):
    intent = stripe.PaymentIntent.create(
        amount=amount * 100,  # Convert to cents
        currency='usd',
        customer=user.stripe_customer_id,
        metadata={
            'user_id': user.id,
            'email': user.email
        }
    )
    
    Payment.objects.create(
        user=user,
        stripe_payment_intent=intent.id,
        amount=amount,
        status='created'
    )
    
    return intent.client_secret
```

**Webhook Handler:**
```python
@csrf_exempt
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META['HTTP_STRIPE_SIGNATURE']
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        return HttpResponse(status=400)
    
    if event['type'] == 'payment_intent.succeeded':
        intent = event['data']['object']
        payment = Payment.objects.get(
            stripe_payment_intent=intent.id
        )
        payment.status = 'succeeded'
        payment.save()
        
        # Grant course access
        grant_course_access(payment.user)
    
    return HttpResponse(status=200)
```

### 10.4 Slack Integration

**Purpose**: Real-time notifications for trainers and admins

**Notification Types:**
- New student registration
- Quiz submission
- Project submission
- Payment received
- System errors

**Implementation:**
```python
import requests

def send_slack_notification(message, channel='#general'):
    if not settings.SLACK_ENABLED:
        return
    
    payload = {
        'channel': channel,
        'username': 'ApraNova Bot',
        'text': message,
        'icon_emoji': ':robot_face:'
    }
    
    response = requests.post(
        settings.SLACK_WEBHOOK_URL,
        json=payload
    )
    
    return response.status_code == 200
```

**Usage Examples:**
```python
# New student registration
send_slack_notification(
    f"🎉 New student registered: {user.email}",
    channel='#registrations'
)

# Quiz submission
send_slack_notification(
    f"📝 {student.name} submitted quiz: {quiz.title} (Score: {score}%)",
    channel='#quiz-submissions'
)

# Project submission
send_slack_notification(
    f"🚀 {student.name} submitted project: {project.title}",
    channel='#project-submissions'
)
```

### 10.5 Email Service Integration

**Purpose**: User notifications and verification

**Email Types:**
- Welcome email
- Email verification
- Password reset
- Quiz results
- Submission feedback

**Configuration:**
```python
# Development: Console backend
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Production: SMTP backend
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'noreply@apranova.com'
EMAIL_HOST_PASSWORD = 'app-specific-password'
```

**Email Templates:**
```python
from django.core.mail import send_mail
from django.template.loader import render_to_string

def send_welcome_email(user):
    subject = 'Welcome to ApraNova!'
    html_message = render_to_string('emails/welcome.html', {
        'user': user,
        'login_url': f'{settings.FRONTEND_URL}/login'
    })
    
    send_mail(
        subject=subject,
        message='',
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        html_message=html_message
    )
```

### 10.6 Docker Engine Integration

**Purpose**: Dynamic workspace provisioning

**Container Management:**
```python
import docker

client = docker.from_env()

def create_workspace(user):
    # Determine workspace type based on track
    if user.track == 'DP':
        image = 'apache/superset:latest'
        port = 8088
    else:
        image = 'codercom/code-server:latest'
        port = 8080
    
    # Create container
    container = client.containers.run(
        image=image,
        name=f'workspace_{user.id}',
        ports={f'{port}/tcp': None},  # Random host port
        detach=True,
        environment={
            'USER_ID': user.id,
            'USER_EMAIL': user.email
        },
        volumes={
            f'workspace_{user.id}_data': {
                'bind': '/home/coder/project',
                'mode': 'rw'
            }
        },
        network='apranova_network'
    )
    
    # Get assigned port
    container.reload()
    host_port = container.ports[f'{port}/tcp'][0]['HostPort']
    
    return {
        'url': f'http://localhost:{host_port}',
        'container_id': container.id,
        'status': 'running'
    }
```


---

## 11. Deployment Architecture

### 11.1 Development Environment

```
┌─────────────────────────────────────────────────────────────┐
│              Local Development Setup                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Developer Machine                                           │
│  ┌────────────────────────────────────────────────────┐     │
│  │                                                     │     │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐        │     │
│  │  │  VS Code │  │  Docker  │  │   Git    │        │     │
│  │  │   IDE    │  │ Desktop  │  │          │        │     │
│  │  └──────────┘  └──────────┘  └──────────┘        │     │
│  │                                                     │     │
│  │  docker-compose up -d                              │     │
│  │  ↓                                                  │     │
│  │  ┌──────────────────────────────────────────┐     │     │
│  │  │  All services running locally            │     │     │
│  │  │  - Frontend: localhost:3000              │     │     │
│  │  │  - Backend: localhost:8000               │     │     │
│  │  │  - Database: localhost:5433              │     │     │
│  │  │  - Redis: localhost:6380                 │     │     │
│  │  └──────────────────────────────────────────┘     │     │
│  │                                                     │     │
│  │  Features:                                          │     │
│  │  - Hot reload (frontend & backend)                 │     │
│  │  - Debug mode enabled                              │     │
│  │  - Console email backend                           │     │
│  │  - Local file storage                              │     │
│  └────────────────────────────────────────────────────┘     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**Start Command:**
```bash
# Windows
.\start-all.ps1

# Linux/Mac
./start-all.sh

# Manual
docker-compose up -d
```

### 11.2 Staging Environment

```
┌─────────────────────────────────────────────────────────────┐
│                 Staging Environment (AWS)                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────────────────────────────────────────┐     │
│  │              Application Load Balancer              │     │
│  │              (HTTPS/SSL Termination)                │     │
│  └──────────────────────┬─────────────────────────────┘     │
│                         │                                     │
│         ┌───────────────┴───────────────┐                   │
│         │                               │                    │
│         ▼                               ▼                    │
│  ┌──────────────┐              ┌──────────────┐            │
│  │   ECS Task   │              │   ECS Task   │            │
│  │  (Frontend)  │              │  (Backend)   │            │
│  │              │              │              │            │
│  │  Next.js     │◄─────────────┤  Django      │            │
│  │  Container   │              │  Container   │            │
│  └──────────────┘              └──────┬───────┘            │
│                                       │                      │
│                                       ▼                      │
│                              ┌──────────────┐               │
│                              │     RDS      │               │
│                              │  PostgreSQL  │               │
│                              └──────────────┘               │
│                                       │                      │
│                                       ▼                      │
│                              ┌──────────────┐               │
│                              │ ElastiCache  │               │
│                              │    Redis     │               │
│                              └──────────────┘               │
│                                                               │
│  Features:                                                   │
│  - Auto-scaling (2-10 instances)                            │
│  - HTTPS enabled                                             │
│  - Real email service                                        │
│  - S3 for static/media files                                │
│  - CloudWatch logging                                        │
│  - Similar to production                                     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### 11.3 Production Environment

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Production Architecture (AWS)                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │                      Route 53 (DNS)                         │    │
│  │                   apranova.com → ALB                        │    │
│  └──────────────────────────┬─────────────────────────────────┘    │
│                             │                                        │
│                             ▼                                        │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │              CloudFront CDN (Global)                        │    │
│  │              - Static assets caching                        │    │
│  │              - DDoS protection                              │    │
│  └──────────────────────────┬─────────────────────────────────┘    │
│                             │                                        │
│                             ▼                                        │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │         Application Load Balancer (Multi-AZ)                │    │
│  │         - SSL/TLS termination                               │    │
│  │         - Health checks                                     │    │
│  │         - Auto-scaling triggers                             │    │
│  └──────────────────────────┬─────────────────────────────────┘    │
│                             │                                        │
│         ┌───────────────────┴───────────────────┐                  │
│         │                                       │                   │
│         ▼                                       ▼                   │
│  ┌──────────────────┐                  ┌──────────────────┐       │
│  │   ECS Cluster    │                  │   ECS Cluster    │       │
│  │   (Frontend)     │                  │   (Backend)      │       │
│  │                  │                  │                  │       │
│  │  ┌────────────┐  │                  │  ┌────────────┐ │       │
│  │  │  Task 1    │  │                  │  │  Task 1    │ │       │
│  │  │  Next.js   │  │                  │  │  Django    │ │       │
│  │  └────────────┘  │                  │  └────────────┘ │       │
│  │  ┌────────────┐  │                  │  ┌────────────┐ │       │
│  │  │  Task 2    │  │◄─────────────────┤  │  Task 2    │ │       │
│  │  │  Next.js   │  │                  │  │  Django    │ │       │
│  │  └────────────┘  │                  │  └────────────┘ │       │
│  │  ┌────────────┐  │                  │  ┌────────────┐ │       │
│  │  │  Task N    │  │                  │  │  Task N    │ │       │
│  │  │  (Auto)    │  │                  │  │  (Auto)    │ │       │
│  │  └────────────┘  │                  │  └────────────┘ │       │
│  └──────────────────┘                  └────────┬─────────┘       │
│                                                  │                  │
│                                                  ▼                  │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │                    Data Layer                               │   │
│  │                                                              │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │   │
│  │  │     RDS      │  │ ElastiCache  │  │      S3      │    │   │
│  │  │  PostgreSQL  │  │    Redis     │  │   Storage    │    │   │
│  │  │  (Multi-AZ)  │  │  (Cluster)   │  │              │    │   │
│  │  │              │  │              │  │  - Static    │    │   │
│  │  │  - Primary   │  │  - Master    │  │  - Media     │    │   │
│  │  │  - Standby   │  │  - Replicas  │  │  - Backups   │    │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘    │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │              Monitoring & Logging                           │   │
│  │                                                              │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │   │
│  │  │  CloudWatch  │  │  CloudWatch  │  │     X-Ray    │    │   │
│  │  │     Logs     │  │   Metrics    │  │   Tracing    │    │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘    │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │                    CI/CD Pipeline                           │   │
│  │                                                              │   │
│  │  GitHub → GitHub Actions → ECR → ECS Deploy                │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 11.4 Deployment Process

**CI/CD Pipeline:**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run tests
        run: |
          docker-compose -f docker-compose.test.yml up --abort-on-container-exit
  
  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1
      
      - name: Build and push backend
        run: |
          docker build -t backend:${{ github.sha }} ./backend
          docker tag backend:${{ github.sha }} $ECR_REGISTRY/backend:latest
          docker push $ECR_REGISTRY/backend:latest
      
      - name: Build and push frontend
        run: |
          docker build -t frontend:${{ github.sha }} ./frontend
          docker tag frontend:${{ github.sha }} $ECR_REGISTRY/frontend:latest
          docker push $ECR_REGISTRY/frontend:latest
  
  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to ECS
        run: |
          aws ecs update-service --cluster apranova-prod \
            --service backend --force-new-deployment
          aws ecs update-service --cluster apranova-prod \
            --service frontend --force-new-deployment
```

**Deployment Steps:**
1. Developer pushes to main branch
2. GitHub Actions triggers
3. Run automated tests
4. Build Docker images
5. Push to Amazon ECR
6. Update ECS services
7. Rolling deployment (zero downtime)
8. Health checks verify deployment
9. Rollback if health checks fail

### 11.5 Scaling Strategy

**Horizontal Scaling:**
```yaml
# ECS Service Auto Scaling
AutoScalingTarget:
  Type: AWS::ApplicationAutoScaling::ScalableTarget
  Properties:
    MinCapacity: 2
    MaxCapacity: 10
    ResourceId: service/apranova-prod/backend
    ScalableDimension: ecs:service:DesiredCount

AutoScalingPolicy:
  Type: AWS::ApplicationAutoScaling::ScalingPolicy
  Properties:
    TargetTrackingScalingPolicyConfiguration:
      TargetValue: 70.0
      PredefinedMetricSpecification:
        PredefinedMetricType: ECSServiceAverageCPUUtilization
```

**Database Scaling:**
- Read replicas for read-heavy operations
- Connection pooling (PgBouncer)
- Query optimization and indexing
- Vertical scaling for write operations

**Cache Strategy:**
- Redis cluster for session storage
- CloudFront for static assets
- Application-level caching
- Database query caching


---

## 12. Scalability & Performance

### 12.1 Performance Metrics

**Target Metrics:**
| Metric | Target | Current |
|--------|--------|---------|
| API Response Time | < 200ms | ~150ms |
| Page Load Time | < 2s | ~1.5s |
| Database Query Time | < 50ms | ~30ms |
| Concurrent Users | 1000+ | Tested: 100 |
| Uptime | 99.9% | - |
| Error Rate | < 0.1% | - |

### 12.2 Caching Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    Caching Layers                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Layer 1: Browser Cache                                      │
│  ┌────────────────────────────────────────────────────┐     │
│  │ - Static assets (CSS, JS, images)                  │     │
│  │ - Cache-Control headers                            │     │
│  │ - Service Worker (PWA - future)                    │     │
│  └────────────────────────────────────────────────────┘     │
│                          │                                    │
│                          ▼                                    │
│  Layer 2: CDN Cache (CloudFront)                             │
│  ┌────────────────────────────────────────────────────┐     │
│  │ - Static files                                      │     │
│  │ - API responses (GET only)                          │     │
│  │ - Edge locations worldwide                          │     │
│  └────────────────────────────────────────────────────┘     │
│                          │                                    │
│                          ▼                                    │
│  Layer 3: Application Cache (Redis)                          │
│  ┌────────────────────────────────────────────────────┐     │
│  │ - Session data                                      │     │
│  │ - User profiles                                     │     │
│  │ - Quiz data                                         │     │
│  │ - Track/Project data                                │     │
│  │ - API response cache                                │     │
│  └────────────────────────────────────────────────────┘     │
│                          │                                    │
│                          ▼                                    │
│  Layer 4: Database Query Cache                               │
│  ┌────────────────────────────────────────────────────┐     │
│  │ - Django ORM query cache                            │     │
│  │ - PostgreSQL query cache                            │     │
│  │ - Prepared statements                               │     │
│  └────────────────────────────────────────────────────┘     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**Redis Cache Implementation:**
```python
from django.core.cache import cache

# Cache user profile
def get_user_profile(user_id):
    cache_key = f'user_profile_{user_id}'
    profile = cache.get(cache_key)
    
    if not profile:
        profile = User.objects.get(id=user_id)
        cache.set(cache_key, profile, timeout=3600)  # 1 hour
    
    return profile

# Cache quiz data
def get_quiz_with_questions(quiz_id):
    cache_key = f'quiz_{quiz_id}'
    quiz = cache.get(cache_key)
    
    if not quiz:
        quiz = Quiz.objects.prefetch_related(
            'questions__answers'
        ).get(id=quiz_id)
        cache.set(cache_key, quiz, timeout=1800)  # 30 minutes
    
    return quiz

# Invalidate cache on update
def update_quiz(quiz_id, data):
    quiz = Quiz.objects.get(id=quiz_id)
    quiz.update(**data)
    cache.delete(f'quiz_{quiz_id}')  # Invalidate cache
```

### 12.3 Database Optimization

**Query Optimization:**
```python
# Bad: N+1 query problem
quizzes = Quiz.objects.all()
for quiz in quizzes:
    print(quiz.questions.all())  # Separate query for each quiz

# Good: Use select_related and prefetch_related
quizzes = Quiz.objects.prefetch_related(
    'questions__answers'
).all()
for quiz in quizzes:
    print(quiz.questions.all())  # No additional queries
```

**Indexes:**
```python
class Quiz(models.Model):
    title = models.CharField(max_length=200, db_index=True)
    created_by = models.ForeignKey(User, db_index=True)
    is_active = models.BooleanField(default=True, db_index=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['created_by', 'is_active']),
            models.Index(fields=['-created_at']),
        ]
```

**Connection Pooling:**
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'CONN_MAX_AGE': 600,  # Connection pooling
        'OPTIONS': {
            'connect_timeout': 10,
            'options': '-c statement_timeout=30000'
        }
    }
}
```

### 12.4 API Performance

**Pagination:**
```python
from rest_framework.pagination import PageNumberPagination

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

# Usage
class QuizListView(ListAPIView):
    queryset = Quiz.objects.all()
    pagination_class = StandardResultsSetPagination
```

**Response Compression:**
```python
MIDDLEWARE = [
    'django.middleware.gzip.GZipMiddleware',  # Compress responses
    # ... other middleware
]
```

**Async Views (Future):**
```python
from django.http import JsonResponse
import asyncio

async def async_quiz_list(request):
    quizzes = await Quiz.objects.all().async_iterator()
    return JsonResponse({'quizzes': list(quizzes)})
```

### 12.5 Frontend Performance

**Code Splitting:**
```typescript
// Dynamic imports for route-based code splitting
const QuizPage = dynamic(() => import('./quiz/page'))
const DashboardPage = dynamic(() => import('./dashboard/page'))
```

**Image Optimization:**
```typescript
import Image from 'next/image'

<Image
  src="/hero.jpg"
  width={800}
  height={600}
  alt="Hero"
  loading="lazy"
  placeholder="blur"
/>
```

**API Request Optimization:**
```typescript
// Debounce search requests
const debouncedSearch = useMemo(
  () => debounce((query) => {
    apiClient.get(`/search?q=${query}`)
  }, 300),
  []
)

// Cancel previous requests
const abortController = new AbortController()
apiClient.get('/data', { signal: abortController.signal })
```

### 12.6 Load Testing

**Test Scenarios:**
```bash
# Apache Bench
ab -n 1000 -c 100 http://localhost:8000/api/quizzes/

# Locust
locust -f locustfile.py --host=http://localhost:8000
```

**Locust Test:**
```python
from locust import HttpUser, task, between

class ApranovaUser(HttpUser):
    wait_time = between(1, 3)
    
    def on_start(self):
        # Login
        response = self.client.post("/api/auth/login/", {
            "email": "test@example.com",
            "password": "password"
        })
        self.token = response.json()['access']
    
    @task(3)
    def view_quizzes(self):
        self.client.get("/api/quiz/quizzes/", headers={
            "Authorization": f"Bearer {self.token}"
        })
    
    @task(1)
    def take_quiz(self):
        self.client.post("/api/quiz/quizzes/1/start/", headers={
            "Authorization": f"Bearer {self.token}"
        })
```

### 12.7 Monitoring & Alerts

**CloudWatch Metrics:**
```yaml
Metrics:
  - CPUUtilization
  - MemoryUtilization
  - RequestCount
  - TargetResponseTime
  - HTTPCode_Target_4XX_Count
  - HTTPCode_Target_5XX_Count

Alarms:
  HighCPU:
    Threshold: 80%
    Action: Scale up
  
  HighErrorRate:
    Threshold: 1%
    Action: Send alert to Slack
  
  SlowResponse:
    Threshold: 1000ms
    Action: Send alert to team
```

**Application Monitoring:**
```python
import logging
import time

logger = logging.getLogger(__name__)

def monitor_performance(func):
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        duration = time.time() - start_time
        
        logger.info(f"{func.__name__} took {duration:.2f}s")
        
        if duration > 1.0:
            logger.warning(f"Slow function: {func.__name__}")
        
        return result
    return wrapper

@monitor_performance
def generate_quiz(prompt):
    # ... quiz generation logic
    pass
```


---

## 13. Monitoring & Logging

### 13.1 Logging Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Logging Flow                              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Application Logs                                            │
│  ┌────────────────────────────────────────────────────┐     │
│  │                                                     │     │
│  │  Backend (Django)        Frontend (Next.js)        │     │
│  │       │                        │                    │     │
│  │       ├─ INFO                  ├─ Console logs     │     │
│  │       ├─ WARNING               ├─ Error tracking   │     │
│  │       ├─ ERROR                 └─ Performance      │     │
│  │       └─ CRITICAL                                   │     │
│  │       │                                             │     │
│  └───────┼─────────────────────────────────────────────┘     │
│          │                                                    │
│          ▼                                                    │
│  ┌────────────────────────────────────────────────────┐     │
│  │         Log Aggregation (CloudWatch)                │     │
│  │  - Centralized logging                              │     │
│  │  - Log groups per service                           │     │
│  │  - Retention policies                               │     │
│  │  - Search and filter                                │     │
│  └────────────────────────────────────────────────────┘     │
│          │                                                    │
│          ▼                                                    │
│  ┌────────────────────────────────────────────────────┐     │
│  │         Analysis & Alerting                         │     │
│  │  - Error rate monitoring                            │     │
│  │  - Performance metrics                              │     │
│  │  - Custom dashboards                                │     │
│  │  - Slack/Email alerts                               │     │
│  └────────────────────────────────────────────────────┘     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### 13.2 Django Logging Configuration

```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
        'json': {
            '()': 'pythonjsonlogger.jsonlogger.JsonFormatter',
            'format': '%(asctime)s %(name)s %(levelname)s %(message)s'
        }
    },
    'filters': {
        'require_debug_true': {
            '()': 'django.utils.log.RequireDebugTrue',
        },
    },
    'handlers': {
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose'
        },
        'file': {
            'level': 'INFO',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': '/var/log/apranova/django.log',
            'maxBytes': 1024 * 1024 * 15,  # 15MB
            'backupCount': 10,
            'formatter': 'verbose',
        },
        'error_file': {
            'level': 'ERROR',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': '/var/log/apranova/django_errors.log',
            'maxBytes': 1024 * 1024 * 15,
            'backupCount': 10,
            'formatter': 'verbose',
        },
        'cloudwatch': {
            'level': 'INFO',
            'class': 'watchtower.CloudWatchLogHandler',
            'log_group': '/aws/ecs/apranova-backend',
            'stream_name': '{strftime:%Y-%m-%d}',
            'formatter': 'json'
        }
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file', 'cloudwatch'],
            'level': 'INFO',
            'propagate': False,
        },
        'django.request': {
            'handlers': ['error_file', 'cloudwatch'],
            'level': 'ERROR',
            'propagate': False,
        },
        'accounts': {
            'handlers': ['console', 'file', 'cloudwatch'],
            'level': 'INFO',
            'propagate': False,
        },
        'quizzes': {
            'handlers': ['console', 'file', 'cloudwatch'],
            'level': 'INFO',
            'propagate': False,
        },
        'curriculum': {
            'handlers': ['console', 'file', 'cloudwatch'],
            'level': 'INFO',
            'propagate': False,
        },
    },
    'root': {
        'handlers': ['console', 'file'],
        'level': 'INFO',
    },
}
```

### 13.3 Application Logging Examples

```python
import logging

logger = logging.getLogger(__name__)

# Info logging
logger.info(f"User {user.email} logged in successfully")

# Warning logging
logger.warning(f"Failed login attempt for {email}")

# Error logging
try:
    quiz = generate_quiz(prompt)
except Exception as e:
    logger.error(f"Quiz generation failed: {str(e)}", exc_info=True)

# Critical logging
logger.critical(f"Database connection lost!")

# Structured logging
logger.info("Quiz created", extra={
    'user_id': user.id,
    'quiz_id': quiz.id,
    'quiz_title': quiz.title,
    'generation_type': quiz.generation_type
})
```

### 13.4 Monitoring Dashboard

**Key Metrics to Monitor:**

```
┌─────────────────────────────────────────────────────────────┐
│                  Monitoring Dashboard                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  System Health                                               │
│  ┌────────────────────────────────────────────────────┐     │
│  │ CPU Usage:        [████████░░] 80%                 │     │
│  │ Memory Usage:     [██████░░░░] 60%                 │     │
│  │ Disk Usage:       [████░░░░░░] 40%                 │     │
│  │ Network I/O:      [███░░░░░░░] 30%                 │     │
│  └────────────────────────────────────────────────────┘     │
│                                                               │
│  Application Metrics                                         │
│  ┌────────────────────────────────────────────────────┐     │
│  │ Active Users:     1,234                             │     │
│  │ Requests/min:     5,678                             │     │
│  │ Avg Response:     150ms                             │     │
│  │ Error Rate:       0.05%                             │     │
│  │ Success Rate:     99.95%                            │     │
│  └────────────────────────────────────────────────────┘     │
│                                                               │
│  Database Metrics                                            │
│  ┌────────────────────────────────────────────────────┐     │
│  │ Connections:      45/100                            │     │
│  │ Query Time:       30ms avg                          │     │
│  │ Slow Queries:     2                                 │     │
│  │ Cache Hit Rate:   95%                               │     │
│  └────────────────────────────────────────────────────┘     │
│                                                               │
│  Business Metrics                                            │
│  ┌────────────────────────────────────────────────────┐     │
│  │ New Signups:      45 today                          │     │
│  │ Active Students:  890                               │     │
│  │ Quizzes Taken:    234 today                         │     │
│  │ Projects Started: 67 today                          │     │
│  │ Workspaces:       123 running                       │     │
│  └────────────────────────────────────────────────────┘     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### 13.5 Alert Configuration

**Alert Rules:**

```yaml
Alerts:
  # System Alerts
  - name: HighCPUUsage
    condition: cpu_usage > 80%
    duration: 5 minutes
    severity: warning
    action: scale_up
    notification: slack
  
  - name: HighMemoryUsage
    condition: memory_usage > 85%
    duration: 5 minutes
    severity: warning
    action: scale_up
    notification: slack
  
  - name: DiskSpaceLow
    condition: disk_usage > 90%
    severity: critical
    action: alert_team
    notification: slack + email
  
  # Application Alerts
  - name: HighErrorRate
    condition: error_rate > 1%
    duration: 5 minutes
    severity: critical
    action: alert_team
    notification: slack + email
  
  - name: SlowResponseTime
    condition: avg_response_time > 1000ms
    duration: 10 minutes
    severity: warning
    action: investigate
    notification: slack
  
  - name: DatabaseConnectionIssue
    condition: db_connections > 90
    severity: critical
    action: scale_db
    notification: slack + email
  
  # Business Alerts
  - name: NoNewSignups
    condition: signups_today == 0
    time: 18:00
    severity: info
    notification: slack
  
  - name: HighQuizFailureRate
    condition: quiz_failure_rate > 50%
    duration: 1 hour
    severity: warning
    action: review_content
    notification: slack
```

### 13.6 Health Check Endpoints

```python
# backend/core/views.py
from django.http import JsonResponse
from django.db import connection
from django.core.cache import cache
import docker

def health_check(request):
    """Comprehensive health check endpoint"""
    health_status = {
        'status': 'healthy',
        'timestamp': timezone.now().isoformat(),
        'checks': {}
    }
    
    # Database check
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        health_status['checks']['database'] = 'healthy'
    except Exception as e:
        health_status['checks']['database'] = f'unhealthy: {str(e)}'
        health_status['status'] = 'unhealthy'
    
    # Redis check
    try:
        cache.set('health_check', 'ok', 10)
        cache.get('health_check')
        health_status['checks']['redis'] = 'healthy'
    except Exception as e:
        health_status['checks']['redis'] = f'unhealthy: {str(e)}'
        health_status['status'] = 'unhealthy'
    
    # Docker check
    try:
        client = docker.from_env()
        client.ping()
        health_status['checks']['docker'] = 'healthy'
    except Exception as e:
        health_status['checks']['docker'] = f'unhealthy: {str(e)}'
        health_status['status'] = 'degraded'
    
    # External services check
    try:
        # Check Gemini API
        response = requests.get('https://generativelanguage.googleapis.com', timeout=5)
        health_status['checks']['gemini_api'] = 'healthy'
    except Exception as e:
        health_status['checks']['gemini_api'] = f'unhealthy: {str(e)}'
        health_status['status'] = 'degraded'
    
    status_code = 200 if health_status['status'] == 'healthy' else 503
    return JsonResponse(health_status, status=status_code)

def readiness_check(request):
    """Check if service is ready to accept traffic"""
    # Simpler check for load balancer
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        return JsonResponse({'status': 'ready'})
    except:
        return JsonResponse({'status': 'not ready'}, status=503)

def liveness_check(request):
    """Check if service is alive"""
    return JsonResponse({'status': 'alive'})
```

### 13.7 Error Tracking

**Sentry Integration (Future):**
```python
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

sentry_sdk.init(
    dsn="https://your-sentry-dsn",
    integrations=[DjangoIntegration()],
    traces_sample_rate=1.0,
    send_default_pii=True,
    environment=os.getenv('ENVIRONMENT', 'development')
)

# Automatic error tracking
# All unhandled exceptions are sent to Sentry

# Manual error tracking
try:
    risky_operation()
except Exception as e:
    sentry_sdk.capture_exception(e)
```

### 13.8 Performance Monitoring

**Custom Metrics:**
```python
from django.core.cache import cache
import time

class PerformanceMonitor:
    @staticmethod
    def track_api_call(endpoint, duration, status_code):
        """Track API call metrics"""
        key = f'api_metrics:{endpoint}:{date.today()}'
        metrics = cache.get(key, {
            'count': 0,
            'total_duration': 0,
            'errors': 0
        })
        
        metrics['count'] += 1
        metrics['total_duration'] += duration
        if status_code >= 400:
            metrics['errors'] += 1
        
        cache.set(key, metrics, timeout=86400)  # 24 hours
    
    @staticmethod
    def get_metrics(endpoint, date):
        """Get metrics for endpoint"""
        key = f'api_metrics:{endpoint}:{date}'
        metrics = cache.get(key, {})
        
        if metrics:
            metrics['avg_duration'] = metrics['total_duration'] / metrics['count']
            metrics['error_rate'] = (metrics['errors'] / metrics['count']) * 100
        
        return metrics

# Middleware to track all requests
class PerformanceMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        start_time = time.time()
        response = self.get_response(request)
        duration = time.time() - start_time
        
        PerformanceMonitor.track_api_call(
            request.path,
            duration,
            response.status_code
        )
        
        return response
```


---

## 14. Future Enhancements

### 14.1 Short-Term Roadmap (3-6 months)

**1. Mobile Application**
```
┌─────────────────────────────────────────┐
│         Mobile App (React Native)        │
├─────────────────────────────────────────┤
│                                          │
│  Features:                               │
│  - Native iOS & Android apps             │
│  - Push notifications                    │
│  - Offline quiz taking                   │
│  - Mobile-optimized workspace            │
│  - Biometric authentication              │
│                                          │
│  Tech Stack:                             │
│  - React Native                          │
│  - Expo                                  │
│  - Same REST API                         │
│                                          │
└─────────────────────────────────────────┘
```

**2. Real-Time Features**
- WebSocket integration for live updates
- Real-time quiz collaboration
- Live coding sessions
- Instant notifications
- Chat between students and trainers

**3. Advanced Analytics**
```
Student Analytics Dashboard:
- Learning progress visualization
- Time spent per project
- Quiz performance trends
- Skill gap analysis
- Personalized recommendations

Trainer Analytics:
- Student performance overview
- Quiz effectiveness metrics
- Submission review queue
- Class progress tracking
```

**4. Gamification**
```
Features:
- Points and badges system
- Leaderboards
- Achievement unlocks
- Streak tracking
- Challenges and competitions
- Rewards for milestones
```

### 14.2 Medium-Term Roadmap (6-12 months)

**1. AI-Powered Features**

**Intelligent Code Review:**
```python
def ai_code_review(code, language):
    """AI-powered code review using Gemini"""
    prompt = f"""
    Review this {language} code and provide:
    1. Code quality assessment
    2. Best practices violations
    3. Security issues
    4. Performance improvements
    5. Suggestions
    
    Code:
    {code}
    """
    
    review = gemini.generate_content(prompt)
    return review
```

**Personalized Learning Paths:**
```python
def generate_learning_path(student):
    """AI-generated personalized curriculum"""
    # Analyze student's:
    # - Quiz performance
    # - Project completion rate
    # - Time spent on topics
    # - Skill gaps
    
    # Generate custom learning path
    path = ai_service.generate_learning_path(
        student_data=student.get_analytics(),
        target_skills=student.track.required_skills
    )
    
    return path
```

**Smart Content Recommendations:**
- Suggest relevant projects based on interests
- Recommend additional resources
- Adaptive difficulty adjustment
- Predict learning outcomes

**2. Video Integration**

```
Video Platform Features:
┌─────────────────────────────────────────┐
│                                          │
│  - Recorded lectures                     │
│  - Live streaming classes                │
│  - Screen recording for projects         │
│  - Video submissions                     │
│  - Interactive video quizzes             │
│  - Timestamp-based comments              │
│                                          │
│  Tech Stack:                             │
│  - AWS MediaConvert                      │
│  - CloudFront for CDN                    │
│  - WebRTC for live streaming             │
│                                          │
└─────────────────────────────────────────┘
```

**3. Advanced Workspace Features**

**Collaborative Workspaces:**
```
Features:
- Pair programming support
- Shared terminals
- Real-time code collaboration
- Voice/video chat integration
- Screen sharing
```

**Workspace Templates:**
```
Pre-configured environments:
- React + TypeScript + Tailwind
- Django + PostgreSQL + Redis
- Data Science (Python + Jupyter)
- Machine Learning (TensorFlow)
- DevOps (Docker + Kubernetes)
```

**4. Certification System**

```
Certification Flow:
┌─────────────────────────────────────────┐
│                                          │
│  1. Complete all track projects          │
│  2. Pass final assessment                │
│  3. Submit capstone project              │
│  4. Peer review                          │
│  5. Trainer evaluation                   │
│  6. Generate certificate                 │
│  7. Blockchain verification (optional)   │
│                                          │
│  Certificate Features:                   │
│  - PDF download                          │
│  - LinkedIn integration                  │
│  - Shareable link                        │
│  - QR code verification                  │
│  - NFT certificate (Web3)                │
│                                          │
└─────────────────────────────────────────┘
```

### 14.3 Long-Term Roadmap (12+ months)

**1. Microservices Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│              Microservices Architecture                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  User    │  │  Quiz    │  │Curriculum│  │ Payment  │   │
│  │ Service  │  │ Service  │  │ Service  │  │ Service  │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       │             │              │             │          │
│       └─────────────┴──────────────┴─────────────┘          │
│                          │                                   │
│                          ▼                                   │
│              ┌────────────────────┐                         │
│              │   API Gateway      │                         │
│              │   (Kong/AWS)       │                         │
│              └────────────────────┘                         │
│                          │                                   │
│                          ▼                                   │
│              ┌────────────────────┐                         │
│              │  Service Mesh      │                         │
│              │   (Istio)          │                         │
│              └────────────────────┘                         │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**Benefits:**
- Independent scaling
- Technology flexibility
- Fault isolation
- Easier maintenance
- Team autonomy

**2. Kubernetes Deployment**

```yaml
# Kubernetes Architecture
apiVersion: apps/v1
kind: Deployment
metadata:
  name: apranova-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: apranova/backend:latest
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
```

**3. AI Teaching Assistant**

```
AI Assistant Features:
┌─────────────────────────────────────────┐
│                                          │
│  - 24/7 student support                  │
│  - Answer coding questions               │
│  - Debug help                            │
│  - Concept explanations                  │
│  - Project guidance                      │
│  - Quiz hints                            │
│  - Natural language interface            │
│  - Voice interaction                     │
│                                          │
│  Tech Stack:                             │
│  - Google Gemini / GPT-4                 │
│  - Vector database (Pinecone)            │
│  - RAG (Retrieval Augmented Generation) │
│  - WebSocket for real-time chat          │
│                                          │
└─────────────────────────────────────────┘
```

**4. Marketplace**

```
Platform Marketplace:
┌─────────────────────────────────────────┐
│                                          │
│  Content Creators Can:                   │
│  - Create and sell courses               │
│  - Publish project templates             │
│  - Share quiz banks                      │
│  - Offer mentorship                      │
│                                          │
│  Students Can:                           │
│  - Purchase additional courses           │
│  - Buy project templates                 │
│  - Access premium content                │
│  - Hire mentors                          │
│                                          │
│  Revenue Sharing:                        │
│  - 70% to creator                        │
│  - 30% to platform                       │
│                                          │
└─────────────────────────────────────────┘
```

**5. Enterprise Features**

```
Enterprise Edition:
┌─────────────────────────────────────────┐
│                                          │
│  - White-label solution                  │
│  - Custom branding                       │
│  - SSO integration (SAML, LDAP)          │
│  - Advanced analytics                    │
│  - Custom reporting                      │
│  - Dedicated support                     │
│  - SLA guarantees                        │
│  - On-premise deployment                 │
│  - Multi-tenancy                         │
│  - API access                            │
│                                          │
│  Pricing:                                │
│  - Per-seat licensing                    │
│  - Volume discounts                      │
│  - Annual contracts                      │
│                                          │
└─────────────────────────────────────────┘
```

### 14.4 Technology Upgrades

**Backend:**
- Migrate to Django 6.x (when released)
- Implement GraphQL API (alongside REST)
- Add gRPC for internal services
- Async views for better performance
- Celery for background tasks

**Frontend:**
- Progressive Web App (PWA)
- Server Components optimization
- Edge rendering
- Improved accessibility (WCAG 2.1 AAA)
- Internationalization (i18n)

**Infrastructure:**
- Multi-region deployment
- Edge computing (CloudFlare Workers)
- Serverless functions for specific tasks
- Blockchain for certificates
- Web3 integration

**Database:**
- Read replicas for scaling
- Sharding for large datasets
- Time-series database for analytics
- Graph database for relationships
- Full-text search (Elasticsearch)

### 14.5 Security Enhancements

**Advanced Security:**
- Two-factor authentication (2FA)
- Biometric authentication
- Advanced threat detection
- DDoS protection
- Web Application Firewall (WAF)
- Regular security audits
- Penetration testing
- Bug bounty program
- GDPR compliance tools
- SOC 2 certification

### 14.6 Integration Ecosystem

**Third-Party Integrations:**
```
Planned Integrations:
- Slack (✅ Done)
- GitHub (✅ Done)
- Google Workspace
- Microsoft Teams
- Zoom
- Discord
- Notion
- Trello
- Jira
- GitLab
- Bitbucket
- AWS
- Azure
- Google Cloud
- Heroku
- Vercel
- Netlify
```

---

## 15. Conclusion

### 15.1 System Summary

ApraNova is a comprehensive, modern Learning Management System built with:
- **Scalable architecture** supporting 1000+ concurrent users
- **Dual-track curriculum** (Data Professional & Full Stack Development)
- **AI-powered features** for quiz generation and content creation
- **Docker-based workspaces** providing isolated development environments
- **Modern tech stack** (Django, Next.js, PostgreSQL, Redis)
- **Robust security** with JWT authentication and RBAC
- **Cloud-ready** deployment architecture
- **Comprehensive monitoring** and logging

### 15.2 Key Strengths

1. **Modular Design**: Easy to maintain and extend
2. **API-First**: RESTful API enables multiple clients
3. **Containerized**: Consistent across environments
4. **Scalable**: Horizontal scaling capability
5. **Secure**: Multiple security layers
6. **Modern UX**: Responsive, intuitive interface
7. **AI-Powered**: Intelligent content generation
8. **Flexible**: Supports multiple learning tracks

### 15.3 Success Metrics

**Technical Metrics:**
- 99.9% uptime
- < 200ms API response time
- < 2s page load time
- 1000+ concurrent users
- Zero data loss

**Business Metrics:**
- Student satisfaction > 4.5/5
- Course completion rate > 80%
- Quiz pass rate > 75%
- Trainer efficiency improved by 50%
- Platform adoption growth

### 15.4 Documentation

**Complete Documentation Set:**
- ✅ System Design Documentation (this document)
- ✅ API Documentation (Swagger/OpenAPI)
- ✅ Deployment Guides (AWS, Docker)
- ✅ User Guides (Student, Trainer, Admin)
- ✅ Developer Documentation
- ✅ Architecture Diagrams
- ✅ Database Schema
- ✅ Security Guidelines
- ✅ Troubleshooting Guides

### 15.5 Support & Maintenance

**Ongoing Support:**
- Regular security updates
- Performance optimization
- Bug fixes
- Feature enhancements
- Documentation updates
- Community support
- Professional support (Enterprise)

---

**Document Version**: 1.0  
**Last Updated**: November 20, 2025  
**Status**: ✅ Complete  
**Maintained By**: ApraNova Development Team

---

**For Questions or Contributions:**
- GitHub: [Repository URL]
- Email: dev@apranova.com
- Slack: #apranova-dev
- Documentation: https://docs.apranova.com

---

**End of System Design Documentation**

