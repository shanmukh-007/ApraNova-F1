# 🏗️ Your AWS Architecture - Visual Guide

## 🌐 Complete Architecture Diagram

```
                                    INTERNET
                                       │
                                       │
                    ┌──────────────────▼──────────────────┐
                    │     Internet Gateway (IGW)          │
                    │     production-igw                  │
                    └──────────────────┬──────────────────┘
                                       │
                    ┌──────────────────▼──────────────────┐
                    │   PUBLIC SUBNETS (Multi-AZ)         │
                    │                                     │
                    │  ┌─────────────────────────────┐   │
                    │  │  Application Load Balancer  │   │
                    │  │  production-alb             │   │
                    │  │  Port 80 (HTTP)             │   │
                    │  │                             │   │
                    │  │  DNS: production-alb-       │   │
                    │  │  1841167835.us-east-1.      │   │
                    │  │  elb.amazonaws.com          │   │
                    │  └─────────────┬───────────────┘   │
                    │                │                    │
                    │  ┌─────────────▼───────────────┐   │
                    │  │  NAT Gateway                │   │
                    │  │  production-nat             │   │
                    │  │  (Elastic IP attached)      │   │
                    │  └─────────────┬───────────────┘   │
                    └────────────────┼────────────────────┘
                                     │
                    ┌────────────────▼────────────────┐
                    │  PRIVATE SUBNETS (Multi-AZ)     │
                    │  10.0.11.0/24, 10.0.12.0/24     │
                    │                                 │
                    │  ┌──────────────────────────┐  │
                    │  │  ECS CLUSTER             │  │
                    │  │  production-cluster      │  │
                    │  │                          │  │
                    │  │  ┌────────────────────┐ │  │
                    │  │  │  Backend Service   │ │  │
                    │  │  │  - 1 task          │ │  │
                    │  │  │  - Port 8000       │ │  │
                    │  │  │  - 0.5 vCPU        │ │  │
                    │  │  │  - 1 GB RAM        │ │  │
                    │  │  │  - Django API      │ │  │
                    │  │  └────────────────────┘ │  │
                    │  │                          │  │
                    │  │  ┌────────────────────┐ │  │
                    │  │  │  Frontend Service  │ │  │
                    │  │  │  - 1 task          │ │  │
                    │  │  │  - Port 3000       │ │  │
                    │  │  │  - 0.25 vCPU       │ │  │
                    │  │  │  - 512 MB RAM      │ │  │
                    │  │  │  - Next.js         │ │  │
                    │  │  └────────────────────┘ │  │
                    │  └──────────────────────────┘  │
                    │                                 │
                    │  ┌──────────────────────────┐  │
                    │  │  RDS PostgreSQL          │  │
                    │  │  production-apranova-db  │  │
                    │  │  - db.t3.micro           │  │
                    │  │  - 20 GB storage         │  │
                    │  │  - Port 5432             │  │
                    │  └──────────────────────────┘  │
                    │                                 │
                    │  ┌──────────────────────────┐  │
                    │  │  ElastiCache Redis       │  │
                    │  │  production-redis        │  │
                    │  │  - cache.t3.micro        │  │
                    │  │  - Port 6379             │  │
                    │  └──────────────────────────┘  │
                    │                                 │
                    │  ┌──────────────────────────┐  │
                    │  │  EFS File System         │  │
                    │  │  fs-0718ee8fff27b133a    │  │
                    │  │  - Workspace storage     │  │
                    │  └──────────────────────────┘  │
                    └─────────────────────────────────┘

                    ┌─────────────────────────────────┐
                    │  CONTAINER REGISTRY (ECR)       │
                    │                                 │
                    │  ┌──────────────────────────┐  │
                    │  │  apranova/backend        │  │
                    │  │  667 MB                  │  │
                    │  └──────────────────────────┘  │
                    │                                 │
                    │  ┌──────────────────────────┐  │
                    │  │  apranova/frontend       │  │
                    │  │  391 MB                  │  │
                    │  └──────────────────────────┘  │
                    └─────────────────────────────────┘

                    ┌─────────────────────────────────┐
                    │  MONITORING (CloudWatch)        │
                    │                                 │
                    │  - /ecs/backend (logs)          │
                    │  - /ecs/frontend (logs)         │
                    │  - Metrics & Alarms             │
                    └─────────────────────────────────┘
```

---

## 🔄 Traffic Flow

### User Request Flow

```
1. User Browser
   ↓
2. DNS Resolution
   production-alb-1841167835.us-east-1.elb.amazonaws.com
   ↓
3. Application Load Balancer (Port 80)
   ↓
4. Routing Decision:
   - Path "/" → Frontend Target Group (Port 3000)
   - Path "/api/*" → Backend Target Group (Port 8000)
   - Path "/admin/*" → Backend Target Group (Port 8000)
   ↓
5. ECS Task (in Private Subnet)
   - Frontend Task OR Backend Task
   ↓
6. Backend connects to:
   - RDS PostgreSQL (database queries)
   - ElastiCache Redis (caching)
   - EFS (file storage)
   ↓
7. Response back through ALB
   ↓
8. User Browser
```

---

## 🔐 Security Architecture

```
┌─────────────────────────────────────────────────┐
│  SECURITY LAYERS                                │
└─────────────────────────────────────────────────┘

Layer 1: Network Isolation
├─ VPC: 10.0.0.0/16 (isolated network)
├─ Public Subnets: Internet-facing (ALB only)
└─ Private Subnets: No direct internet access

Layer 2: Security Groups (Firewall Rules)
├─ ALB SG: Allow 80, 443 from Internet
├─ ECS SG: Allow all from ALB SG only
├─ RDS SG: Allow 5432 from ECS SG only
└─ Redis SG: Allow 6379 from ECS SG only

Layer 3: IAM Roles (Access Control)
├─ ECS Task Execution Role
│  ├─ Pull images from ECR
│  └─ Write logs to CloudWatch
└─ ECS Task Role
   ├─ Access to EFS
   └─ Access to S3 (if needed)

Layer 4: Encryption
├─ EFS: Encrypted in transit
├─ RDS: Can enable encryption at rest
└─ ALB: Can add SSL certificate for HTTPS
```

---

## 💾 Data Flow

```
┌─────────────────────────────────────────────────┐
│  DATA STORAGE & PERSISTENCE                    │
└─────────────────────────────────────────────────┘

User Data
   ↓
Backend API (Django)
   ↓
   ├─→ PostgreSQL (RDS)
   │   ├─ User accounts
   │   ├─ Course data
   │   ├─ Progress tracking
   │   └─ Submissions
   │
   ├─→ Redis (ElastiCache)
   │   ├─ Session data
   │   ├─ Cache
   │   └─ Temporary data
   │
   └─→ EFS (File System)
       ├─ Workspace files
       ├─ User uploads
       └─ Static files
```

---

## 🌍 Geographic Distribution

```
Region: us-east-1 (N. Virginia)

Availability Zone A (us-east-1a)
├─ Public Subnet: 10.0.1.0/24
│  └─ ALB (active)
├─ Private Subnet: 10.0.11.0/24
│  ├─ ECS Tasks
│  ├─ RDS (if Multi-AZ: standby)
│  └─ EFS Mount Target

Availability Zone B (us-east-1b)
├─ Public Subnet: 10.0.2.0/24
│  └─ ALB (active)
└─ Private Subnet: 10.0.12.0/24
   ├─ ECS Tasks
   ├─ RDS (if Multi-AZ: primary)
   └─ EFS Mount Target
```

---

## 📊 Resource Relationships

```
VPC (production-vpc)
│
├─ Internet Gateway (production-igw)
│  └─ Attached to VPC
│
├─ Subnets (4 total)
│  ├─ Public Subnets (2)
│  │  ├─ Route to Internet Gateway
│  │  └─ Contains: ALB, NAT Gateway
│  │
│  └─ Private Subnets (2)
│     ├─ Route to NAT Gateway
│     └─ Contains: ECS, RDS, Redis, EFS
│
├─ Security Groups (4)
│  ├─ ALB SG → Allows internet traffic
│  ├─ ECS SG → Allows ALB traffic
│  ├─ RDS SG → Allows ECS traffic
│  └─ Redis SG → Allows ECS traffic
│
├─ Load Balancer (production-alb)
│  ├─ Listener: Port 80
│  ├─ Target Group: Backend (port 8000)
│  └─ Target Group: Frontend (port 3000)
│
├─ ECS Cluster (production-cluster)
│  ├─ Service: Backend (1 task)
│  └─ Service: Frontend (1 task)
│
├─ RDS Instance (production-apranova-db)
│  └─ Database: apranova_db
│
├─ ElastiCache Cluster (production-redis)
│  └─ Node: cache.t3.micro
│
└─ EFS File System (fs-0718ee8fff27b133a)
   ├─ Mount Target: AZ-A
   └─ Mount Target: AZ-B
```

---

## 🎯 Service Dependencies

```
Frontend Service
├─ Depends on: Backend Service
├─ Connects to: Backend API via ALB
└─ Registered in: Frontend Target Group

Backend Service
├─ Depends on: RDS, Redis
├─ Connects to:
│  ├─ RDS PostgreSQL (database)
│  ├─ ElastiCache Redis (cache)
│  └─ EFS (file storage)
└─ Registered in: Backend Target Group

RDS PostgreSQL
├─ Independent service
└─ Accessed by: Backend Service only

ElastiCache Redis
├─ Independent service
└─ Accessed by: Backend Service only

EFS
├─ Independent service
└─ Mounted by: ECS Tasks
```

---

## 💰 Cost Attribution

```
Monthly Cost Breakdown: ~$134

Compute (30%)
├─ ECS Fargate: $40
└─ Purpose: Run application containers

Database (20%)
├─ RDS PostgreSQL: $15
├─ ElastiCache Redis: $12
└─ Purpose: Data storage and caching

Networking (37%)
├─ NAT Gateway: $33
├─ ALB: $16
└─ Purpose: Internet access and load balancing

Storage (8%)
├─ EFS: $10
└─ Purpose: Persistent file storage

Other (5%)
├─ ECR: $1
├─ CloudWatch: $2
├─ Data Transfer: $5
└─ Purpose: Monitoring and registry
```

---

## 🔍 Where to Find Everything

### AWS Console Quick Links

**Main Dashboard:**
https://console.aws.amazon.com/console/home?region=us-east-1

**Your Services:**
1. ECS: https://console.aws.amazon.com/ecs/home?region=us-east-1#/clusters/production-cluster
2. RDS: https://console.aws.amazon.com/rds/home?region=us-east-1
3. ElastiCache: https://console.aws.amazon.com/elasticache/home?region=us-east-1
4. VPC: https://console.aws.amazon.com/vpc/home?region=us-east-1
5. EC2 (ALB, SG): https://console.aws.amazon.com/ec2/home?region=us-east-1
6. ECR: https://console.aws.amazon.com/ecr/repositories?region=us-east-1
7. CloudWatch: https://console.aws.amazon.com/cloudwatch/home?region=us-east-1
8. EFS: https://console.aws.amazon.com/efs/home?region=us-east-1
9. Billing: https://console.aws.amazon.com/billing/home

---

## 📋 Summary

**Account:** 322388074242  
**Region:** us-east-1  
**VPC:** production-vpc (10.0.0.0/16)  
**Resources:** 31 total  
**Services:** 10 AWS services  
**Cost:** ~$134/month  
**URL:** http://production-alb-1841167835.us-east-1.elb.amazonaws.com

**All architecture diagrams and details are documented!** 🚀
