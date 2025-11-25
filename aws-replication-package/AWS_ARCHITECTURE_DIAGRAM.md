# ApraNova AWS Architecture Diagram

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              Internet                                    │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   Route 53 (DNS)        │
                    │   apranova.com          │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   CloudFront CDN        │
                    │   (Static Assets)       │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │        AWS WAF            │
                    │       (Security)         
                    └────────────┬────────────┘
                                 │
┌────────────────────────────────▼────────────────────────────────────────┐
│                    Application Load Balancer                            │
│                    (SSL Termination + Routing)                          │
│                    Port 443 (HTTPS)                                     │
└──────┬──────────────────────┬──────────────────────┬────────────────────┘
       │                      │                      │
       │/                     │/api                   │/workspace
       │                      │                      │
┌──────▼──────┐      ┌────────▼────────┐    ┌───────▼────────────┐
│  Frontend   │      │   Backend API   │    │ Workspace Manager  │
│  (Next.js)  │      │   (Django)      │    │ (Lambda Function)  │
│             │      │                 │    │                    │
│  ECS        │      │  ECS Fargate    │    │  Triggers:         │
│  Fargate    │      │  Auto-Scaling   │    │  - Student request │
│  2-10 tasks │      │  2-20 tasks     │    │  - Activity check  │
└─────────────┘      └────────┬────────┘    └──────┬─────────────┘
                              │                    │
                              │                    │ Launch/Terminate
                              │                    │
                     ┌────────▼────────────────────▼─────────────┐
                     │         VPC (10.0.0.0/16)                 │
                     │                                           │
                     │  ┌──────────────────────────────────────┐ │
                     │  │   Public Subnets (3 AZs)             │ │
                     │  │   - NAT Gateways                     │ │
                     │  │   - Internet Gateway                 │ │
                     │  └──────────────────────────────────────┘ │
                     │                                           │
                     │  ┌──────────────────────────────────────┐ │
                     │  │   Private Subnets (3 AZs)            │ │
                     │  │                                      │ │
                     │  │  ┌────────────────────────────────┐  │ │
                     │  │  │  ECS Cluster                   │  │ │
                     │  │  │                                │  │ │
                     │  │  │  ┌──────────┐  ┌──────────┐    │  │ │
                     │  │  │  │ Backend  │  │ Frontend │    │  │ │
                     │  │  │  │ Tasks    │  │ Tasks    │    │  │ │
                     │  │  │  └──────────┘  └──────────┘    │  │ │
                     │  │  │                                │  │ │
                     │  │  │  ┌──────────────────────────┐  │  │ │
                     │  │  │  │ Workspace Containers     │  │  │ │
                     │  │  │  │ (On-Demand)              │  │ │ │
                     │  │  │  │                          │ │ │ │
                     │  │  │  │ ┌────────┐  ┌─────────┐ │ │ │ │
                     │  │  │  │ │ VS Code│  │Superset │ │ │ │ │
                     │  │  │  │ │ (FSD)  │  │  (DP)   │ │ │ │ │
                     │  │  │  │ └────────┘  └─────────┘ │ │ │ │
                     │  │  │  └──────────────────────────┘ │ │ │
                     │  │  └────────────────────────────────┘ │ │
                     │  │                                      │ │
                     │  │  ┌────────────────────────────────┐ │ │
                     │  │  │  RDS PostgreSQL (Multi-AZ)     │ │ │
                     │  │  │  - Primary (AZ-1)              │ │ │
                     │  │  │  - Standby (AZ-2)              │ │ │
                     │  │  │  - Automated Backups           │ │ │
                     │  │  └────────────────────────────────┘ │ │
                     │  │                                      │ │
                     │  │  ┌────────────────────────────────┐ │ │
                     │  │  │  ElastiCache Redis             │ │ │
                     │  │  │  - Cluster Mode                │ │ │
                     │  │  │  - Multi-AZ                    │ │ │
                     │  │  └────────────────────────────────┘ │ │
                     │  │                                      │ │
                     │  └──────────────────────────────────────┘ │
                     └────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                         Storage Layer                                   │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│  │     EFS      │  │      S3      │  │  DynamoDB    │                   │
│  │  (Workspace  │  │  (Backups)   │  │  (Workspace  │                   │
│  │   Storage)   │  │              │  │   State)     │                   │
│  └──────────────┘  └──────────────┘  └──────────────┘                   │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                      Monitoring & Logging                               │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│  │  CloudWatch  │  │  CloudTrail  │  │  GuardDuty   │                   │
│  │  (Metrics &  │  │  (Audit      │  │  (Threat     │                   │
│  │   Logs)      │  │   Logs)      │  │  Detection)  │                   │
│  └──────────────┘  └──────────────┘  └──────────────┘                   │
└─────────────────────────────────────────────────────────────────────────┘
```

## Workspace Lifecycle Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Student Workspace Lifecycle                          │
└─────────────────────────────────────────────────────────────────────────┘

1. Student Request
   │
   ├─> Student clicks "Launch Workspace"
   │
   └─> Frontend sends POST /api/workspace/create/

2. Backend Processing
   │
   ├─> Backend authenticates user
   │
   ├─> Determines workspace type (VS Code or Superset)
   │
   └─> Invokes Lambda Workspace Manager

3. Lambda Decision Tree
   │
   ├─> Check if user has existing workspace
   │   ├─> Yes: Return existing URL (< 1 second)
   │   └─> No: Continue
   │
   ├─> Check warm pool for available container
   │   ├─> Available:
   │   │   ├─> Assign to user (< 2 seconds)
   │   │   ├─> Launch replacement warm container
   │   │   └─> Return URL
   │   │
   │   └─> Not Available:
   │       ├─> Launch new ECS Fargate task
   │       ├─> Wait for RUNNING state (25-30 seconds)
   │       ├─> Mount user's EFS volume
   │       ├─> Record in DynamoDB
   │       └─> Return URL

4. Student Access
   │
   ├─> Student redirected to workspace URL
   │
   ├─> VS Code or Superset loads in browser
   │
   └─> All files persisted on EFS

5. Activity Monitoring (Every 5 minutes)
   │
   ├─> Lambda checks all running workspaces
   │
   ├─> For each workspace:
   │   ├─> Check last_activity timestamp
   │   ├─> If idle > 30 minutes:
   │   │   ├─> Save workspace state
   │   │   ├─> Stop ECS task
   │   │   ├─> Update DynamoDB (status = stopped)
   │   │   └─> Record metrics
   │   └─> Else: Continue monitoring
   │
   └─> Maintain warm pool (ensure 3 containers ready)

6. Next Launch
   │
   ├─> Student clicks "Launch Workspace" again
   │
   ├─> Lambda finds stopped workspace
   │
   ├─> Launches new container with same EFS volume
   │
   └─> Student resumes from last state (no data loss)
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Request Flow                                     │
└─────────────────────────────────────────────────────────────────────────┘

User Browser
    │
    │ HTTPS
    ▼
CloudFront (CDN)
    │
    │ Cache static assets
    ▼
Application Load Balancer
    │
    ├─────────────────┬─────────────────┬─────────────────┐
    │                 │                 │                 │
    │ /               │ /api            │ /workspace      │
    ▼                 ▼                 ▼                 │
Frontend          Backend API      Lambda Manager       │
(Next.js)         (Django)         (Python)             │
    │                 │                 │                 │
    │                 │                 │                 │
    │                 ├─> PostgreSQL    ├─> DynamoDB      │
    │                 │   (User data)   │   (Workspace    │
    │                 │                 │    state)       │
    │                 │                 │                 │
    │                 ├─> Redis         ├─> ECS API       │
    │                 │   (Cache)       │   (Launch       │
    │                 │                 │    tasks)       │
    │                 │                 │                 │
    │                 └─> EFS           └─> CloudWatch    │
    │                     (Files)           (Metrics)     │
    │                                                     │
    └─────────────────────────────────────────────────────┘
                              │
                              ▼
                    Workspace Container
                    (VS Code / Superset)
                              │
                              ├─> EFS (User files)
                              └─> Internet (Git, npm, etc.)
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Security Layers                                  │
└─────────────────────────────────────────────────────────────────────────┘

Layer 1: Network Security
    │
    ├─> AWS WAF (Web Application Firewall)
    │   ├─> SQL Injection protection
    │   ├─> XSS protection
    │   └─> Rate limiting
    │
    ├─> VPC (Virtual Private Cloud)
    │   ├─> Public subnets (ALB, NAT)
    │   ├─> Private subnets (ECS, RDS, Redis)
    │   └─> Network ACLs
    │
    └─> Security Groups
        ├─> ALB: Allow 443 from 0.0.0.0/0
        ├─> Backend: Allow 8000 from ALB only
        ├─> RDS: Allow 5432 from Backend only
        └─> Workspace: Allow 8080/8088 from Backend only

Layer 2: Data Encryption
    │
    ├─> In Transit
    │   ├─> TLS 1.2+ for all HTTPS traffic
    │   ├─> RDS SSL connections
    │   └─> EFS encryption in transit
    │
    └─> At Rest
        ├─> RDS encryption (KMS)
        ├─> EFS encryption (KMS)
        ├─> S3 encryption (SSE-S3)
        └─> EBS encryption (KMS)

Layer 3: Access Control
    │
    ├─> IAM Roles (No hardcoded credentials)
    │   ├─> ECS Task Role (access to EFS, S3)
    │   ├─> Lambda Role (access to ECS, DynamoDB)
    │   └─> EC2 Instance Profile (for ECS hosts)
    │
    ├─> Secrets Manager
    │   ├─> Database passwords
    │   ├─> API keys
    │   └─> JWT secrets
    │
    └─> Parameter Store
        ├─> Configuration values
        └─> Non-sensitive settings

Layer 4: Monitoring & Compliance
    │
    ├─> CloudTrail (Audit logs)
    │   └─> All API calls logged
    │
    ├─> GuardDuty (Threat detection)
    │   └─> Anomaly detection
    │
    ├─> AWS Config (Compliance)
    │   └─> Resource compliance checks
    │
    └─> CloudWatch Logs
        └─> Application logs (7-day retention)
```

## Cost Optimization Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Cost Optimization Strategy                            │
└─────────────────────────────────────────────────────────────────────────┘

Traditional Approach:
    100 students × 24/7 containers = $3,604/month
    ┌─────────────────────────────────────────────────────────┐
    │ ████████████████████████████████████████████████████████│ $3,604
    └─────────────────────────────────────────────────────────┘

Optimized Approach:
    Warm Pool (3) + On-Demand = $552/month
    ┌──────────────┐
    │ ████████████ │ $552
    └──────────────┘
    
    SAVINGS: $3,052/month (84.7%)

How We Achieve This:

1. Warm Pool (3 containers × 24/7)
   ├─> Cost: $87.60/month
   └─> Benefit: Instant access for first 3 students

2. On-Demand (100 students × 3 hours/day)
   ├─> Cost: $360/month
   └─> Benefit: Only pay when students use workspace

3. Auto-Termination (30 min idle timeout)
   ├─> Savings: $2,500+/month
   └─> Benefit: No wasted resources

4. Fargate Spot (Optional, 70% discount)
   ├─> Additional Savings: $200-500/month
   └─> Trade-off: Possible interruptions

5. Reserved Instances (RDS, 1-year)
   ├─> Savings: $150-200/month
   └─> Trade-off: Upfront commitment

Total Monthly Cost Breakdown:
    ┌─────────────────────────────────────────┐
    │ Core Services:        $193 (17%)        │
    │ Workspaces:           $552 (47%)        │
    │ Storage:              $312 (27%)        │
    │ Monitoring:           $20  (2%)         │
    │ Data Transfer:        $90  (8%)         │
    ├─────────────────────────────────────────┤
    │ TOTAL:                $1,167            │
    │ Per Student:          $11.67            │
    └─────────────────────────────────────────┘
```

## Scaling Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Auto-Scaling Strategy                            │
└─────────────────────────────────────────────────────────────────────────┘

Backend API (ECS Service)
    │
    ├─> Min: 2 tasks
    ├─> Max: 20 tasks
    ├─> Target: CPU 70%
    │
    └─> Scaling Events:
        ├─> Scale Up: CPU > 70% for 2 minutes
        ├─> Scale Down: CPU < 40% for 5 minutes
        └─> Cooldown: 60 seconds

Frontend (ECS Service)
    │
    ├─> Min: 2 tasks
    ├─> Max: 10 tasks
    ├─> Target: CPU 70%
    │
    └─> Scaling Events:
        ├─> Scale Up: CPU > 70% for 2 minutes
        ├─> Scale Down: CPU < 40% for 5 minutes
        └─> Cooldown: 60 seconds

Workspaces (On-Demand)
    │
    ├─> No fixed limit
    ├─> Launch on demand
    ├─> Warm pool: 3 containers
    │
    └─> Scaling Events:
        ├─> Peak Hours (9 AM - 9 PM): Warm pool = 5
        ├─> Off Hours (9 PM - 9 AM): Warm pool = 1
        └─> Weekend: Warm pool = 2

Database (RDS)
    │
    ├─> Start: db.t3.medium
    ├─> Scale: db.r5.large (when needed)
    │
    └─> Scaling Triggers:
        ├─> CPU > 80% for 10 minutes
        ├─> Connections > 80% of max
        └─> Manual scaling (requires downtime)

Cache (ElastiCache)
    │
    ├─> Start: cache.t3.micro
    ├─> Scale: cache.r5.large (when needed)
    │
    └─> Scaling Triggers:
        ├─> Memory > 80%
        ├─> Evictions > 1000/min
        └─> Add read replicas for read-heavy workloads
```

---

## Legend

```
┌─────────┐
│ Service │  = AWS Service
└─────────┘

────────>    = Data Flow

├─>          = Decision/Branch

▼            = Direction of Flow

█            = Cost Bar (visual representation)
```

