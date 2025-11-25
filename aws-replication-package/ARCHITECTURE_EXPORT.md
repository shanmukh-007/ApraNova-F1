# 🏗️ Complete Architecture Export

This file contains all architecture diagrams, configurations, and documentation for replication.

---

## 📊 Architecture Diagrams

### 1. High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         INTERNET                                │
└────────────────────────────┬────────────────────────────────────┘
                             │
                ┌────────────▼────────────┐
                │  Application Load       │
                │  Balancer (ALB)         │
                │  Port 80/443            │
                └────────┬────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        │ /              │ /api/*         │ /admin/*
        ▼                ▼                ▼
┌───────────────┐  ┌──────────────┐  ┌──────────────┐
│   Frontend    │  │   Backend    │  │   Backend    │
│   (Next.js)   │  │   (Django)   │  │   (Django)   │
│   Port 3000   │  │   Port 8000  │  │   Port 8000  │
│               │  │              │  │              │
│  ECS Fargate  │  │ ECS Fargate  │  │ ECS Fargate  │
│  0.25 vCPU    │  │  0.5 vCPU    │  │  0.5 vCPU    │
│  512 MB       │  │  1024 MB     │  │  1024 MB     │
└───────────────┘  └──────┬───────┘  └──────┬───────┘
                          │                  │
                          └────────┬─────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
                    ▼              ▼              ▼
            ┌──────────────┐ ┌──────────┐ ┌──────────┐
            │  PostgreSQL  │ │  Redis   │ │   EFS    │
            │  (RDS)       │ │(ElastiC) │ │  (Files) │
            │  Port 5432   │ │Port 6379 │ │          │
            └──────────────┘ └──────────┘ └──────────┘
```

### 2. Network Architecture

```
VPC: 10.0.0.0/16
│
├─ Public Subnets (Internet-facing)
│  ├─ 10.0.1.0/24 (AZ-A)
│  │  ├─ Application Load Balancer
│  │  └─ NAT Gateway
│  │
│  └─ 10.0.2.0/24 (AZ-B)
│     ├─ Application Load Balancer
│     └─ NAT Gateway (optional)
│
└─ Private Subnets (Internal only)
   ├─ 10.0.11.0/24 (AZ-A)
   │  ├─ ECS Tasks (Backend/Frontend)
   │  ├─ RDS Primary
   │  ├─ ElastiCache Node
   │  └─ EFS Mount Target
   │
   └─ 10.0.12.0/24 (AZ-B)
      ├─ ECS Tasks (Backend/Frontend)
      ├─ RDS Standby (if Multi-AZ)
      ├─ ElastiCache Node
      └─ EFS Mount Target
```

### 3. Security Groups

```
┌─────────────────────────────────────────────────────────┐
│  ALB Security Group                                     │
│  ├─ Inbound: 0.0.0.0/0 → Port 80 (HTTP)               │
│  ├─ Inbound: 0.0.0.0/0 → Port 443 (HTTPS)             │
│  └─ Outbound: All traffic                              │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  ECS Security Group                                     │
│  ├─ Inbound: ALB SG → All ports                        │
│  └─ Outbound: All traffic                              │
└─────────────────────────────────────────────────────────┘
                         │
                ┌────────┼────────┐
                ▼        ▼        ▼
┌──────────────┐ ┌──────────┐ ┌──────────┐
│  RDS SG      │ │ Redis SG │ │  EFS SG  │
│  ├─ In: ECS  │ │ ├─ In:   │ │ ├─ In:   │
│  │   → 5432  │ │ │   ECS   │ │ │   ECS   │
│  └─ Out: All │ │ │   → 6379│ │ │   → 2049│
└──────────────┘ └──────────┘ └──────────┘
```

### 4. Data Flow

```
User Request
    │
    ▼
┌─────────────────────────────────────────┐
│  1. DNS Resolution                      │
│     production-alb-xxx.amazonaws.com    │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  2. ALB Routing                         │
│     ├─ / → Frontend Target Group        │
│     └─ /api/* → Backend Target Group    │
└─────────────────┬───────────────────────┘
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
┌──────────────┐    ┌──────────────┐
│  3. Frontend │    │  3. Backend  │
│     Task     │    │     Task     │
└──────────────┘    └──────┬───────┘
                           │
                ┌──────────┼──────────┐
                ▼          ▼          ▼
        ┌──────────┐ ┌─────────┐ ┌──────┐
        │  4. RDS  │ │ 4. Redis│ │4. EFS│
        │  Query   │ │  Cache  │ │ File │
        └──────────┘ └─────────┘ └──────┘
                           │
                           ▼
                ┌──────────────────┐
                │  5. Response     │
                │     Back to User │
                └──────────────────┘
```

### 5. CI/CD Pipeline

```
┌─────────────────────────────────────────────────────────┐
│  Developer                                              │
│  ├─ git push origin main                               │
│  └─ Manual trigger GitHub Actions                      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  GitHub Actions                                         │
│  ├─ Checkout code                                       │
│  ├─ Run tests (optional)                                │
│  ├─ Build Docker image                                  │
│  └─ Push to ECR                                         │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Amazon ECR                                             │
│  ├─ Store Docker images                                 │
│  └─ Tag: latest, commit-sha                             │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  ECS Service Update                                     │
│  ├─ Update task definition                              │
│  ├─ Deploy new tasks                                    │
│  ├─ Wait for health checks                              │
│  └─ Drain old tasks                                     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Production                                             │
│  ├─ New version running                                 │
│  └─ Zero downtime deployment                            │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 Configuration Files

### 1. Terraform Variables

```hcl
variable "aws_region" {
  description = "AWS region"
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  default     = "production"
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "vpc_cidr" {
  description = "VPC CIDR block"
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "Availability zones"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}
```

### 2. Environment Variables

```bash
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=your-account-id

# Database
DB_NAME=apranova_db
DB_USER=apranova_admin
DB_PASSWORD=your-secure-password
DB_HOST=your-rds-endpoint
DB_PORT=5432
DATABASE_URL=postgresql://user:pass@host:5432/db

# Redis
REDIS_HOST=your-redis-endpoint
REDIS_PORT=6379
REDIS_URL=redis://host:6379/0

# Django
DJANGO_SECRET_KEY=your-secret-key
DEBUG=False
ALLOWED_HOSTS=your-alb-dns,localhost

# Next.js
NEXT_PUBLIC_API_URL=http://your-alb-dns
BACKEND_URL=http://your-alb-dns
NODE_ENV=production

# Stripe
STRIPE_PUBLIC_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### 3. Docker Compose (Local Development)

```yaml
version: '3.8'

services:
  db:
    image: postgres:14
    environment:
      POSTGRES_DB: apranova_db
      POSTGRES_USER: apranova_user
      POSTGRES_PASSWORD: password
    ports:
      - "5433:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6380:6379"
    volumes:
      - redis_data:/data

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://apranova_user:password@db:5432/apranova_db
      REDIS_URL: redis://redis:6379/0
    depends_on:
      - db
      - redis

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8000
    depends_on:
      - backend

volumes:
  postgres_data:
  redis_data:
```

---

## 📋 Resource Specifications

### ECS Task Definitions

#### Backend Task
```json
{
  "cpu": "512",
  "memory": "1024",
  "containerPort": 8000,
  "healthCheck": {
    "command": ["CMD-SHELL", "curl -f http://localhost:8000/health || exit 1"],
    "interval": 30,
    "timeout": 5,
    "retries": 3
  }
}
```

#### Frontend Task
```json
{
  "cpu": "256",
  "memory": "512",
  "containerPort": 3000,
  "healthCheck": {
    "command": ["CMD-SHELL", "curl -f http://localhost:3000 || exit 1"],
    "interval": 30,
    "timeout": 5,
    "retries": 3
  }
}
```

### RDS Configuration
```
Engine: PostgreSQL 14
Instance: db.t3.micro
Storage: 20 GB GP2
Multi-AZ: Optional
Backup: 7 days retention
Encryption: Optional
```

### ElastiCache Configuration
```
Engine: Redis 7
Node: cache.t3.micro
Nodes: 1
Encryption: In-transit
Backup: Optional
```

### EFS Configuration
```
Performance Mode: General Purpose
Throughput Mode: Bursting
Encryption: In-transit
Lifecycle: Optional
```

---

## 💰 Cost Breakdown

### Monthly Costs (Detailed)

```
Compute:
├─ ECS Fargate (Backend)
│  ├─ 0.5 vCPU × $0.04048/hour × 730 hours = $14.78
│  └─ 1 GB RAM × $0.004445/hour × 730 hours = $3.24
│  Total: $18.02
│
├─ ECS Fargate (Frontend)
│  ├─ 0.25 vCPU × $0.04048/hour × 730 hours = $7.39
│  └─ 0.5 GB RAM × $0.004445/hour × 730 hours = $1.62
│  Total: $9.01
│
└─ Compute Total: $27.03

Database:
├─ RDS db.t3.micro
│  ├─ Instance: $0.017/hour × 730 hours = $12.41
│  └─ Storage: 20 GB × $0.115/GB = $2.30
│  Total: $14.71
│
└─ ElastiCache cache.t3.micro
   └─ Instance: $0.017/hour × 730 hours = $12.41

Networking:
├─ NAT Gateway
│  ├─ Gateway: $0.045/hour × 730 hours = $32.85
│  └─ Data: 10 GB × $0.045/GB = $0.45
│  Total: $33.30
│
└─ Application Load Balancer
   ├─ ALB: $0.0225/hour × 730 hours = $16.43
   └─ LCU: 1 × $0.008/hour × 730 hours = $5.84
   Total: $22.27

Storage:
├─ EFS: 10 GB × $0.30/GB = $3.00
└─ ECR: 1 GB × $0.10/GB = $0.10

Monitoring:
├─ CloudWatch Logs: 5 GB × $0.50/GB = $2.50
└─ CloudWatch Metrics: $0.30

Data Transfer:
└─ Outbound: 10 GB × $0.09/GB = $0.90

──────────────────────────────────────
TOTAL: $116.55/month

With optimizations:
- Remove NAT Gateway: -$33.30
- Use Fargate Spot: -$8.10
- Reduce logging: -$1.50
──────────────────────────────────────
Optimized Total: $73.65/month
```

---

## 🔐 Security Configuration

### IAM Roles

#### ECS Task Execution Role
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "logs:CreateLogGroup"
      ],
      "Resource": "*"
    }
  ]
}
```

#### ECS Task Role
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "elasticfilesystem:ClientMount",
        "elasticfilesystem:ClientWrite",
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": [
        "arn:aws:elasticfilesystem:*:*:file-system/*",
        "arn:aws:s3:::your-bucket/*"
      ]
    }
  ]
}
```

### Security Best Practices

1. **Network Security**
   - Use private subnets for all compute resources
   - Restrict security group rules to minimum required
   - Enable VPC Flow Logs

2. **Data Encryption**
   - Enable RDS encryption at rest
   - Enable EFS encryption in transit
   - Use SSL/TLS for all connections

3. **Access Control**
   - Use IAM roles, not access keys
   - Implement least privilege principle
   - Enable MFA for AWS console

4. **Monitoring**
   - Enable CloudTrail for audit logs
   - Set up CloudWatch alarms
   - Use AWS Config for compliance

---

## 📊 Monitoring & Alerts

### CloudWatch Metrics to Monitor

```
ECS Metrics:
├─ CPUUtilization (Target: < 70%)
├─ MemoryUtilization (Target: < 80%)
├─ TaskCount (Min: 1, Max: 10)
└─ HealthyHostCount (Min: 1)

RDS Metrics:
├─ CPUUtilization (Target: < 80%)
├─ DatabaseConnections (Max: 100)
├─ FreeStorageSpace (Min: 5 GB)
└─ ReadLatency / WriteLatency

ALB Metrics:
├─ TargetResponseTime (Target: < 1s)
├─ HTTPCode_Target_5XX_Count (Target: 0)
├─ RequestCount
└─ HealthyHostCount (Min: 1)

ElastiCache Metrics:
├─ CPUUtilization (Target: < 75%)
├─ DatabaseMemoryUsagePercentage (Target: < 80%)
├─ CurrConnections
└─ Evictions (Target: 0)
```

### Recommended Alarms

```yaml
Alarms:
  - Name: HighCPU
    Metric: CPUUtilization
    Threshold: 80%
    Duration: 5 minutes
    Action: SNS notification

  - Name: HighMemory
    Metric: MemoryUtilization
    Threshold: 85%
    Duration: 5 minutes
    Action: SNS notification

  - Name: UnhealthyTargets
    Metric: UnHealthyHostCount
    Threshold: 1
    Duration: 2 minutes
    Action: SNS notification + Auto-scaling

  - Name: DatabaseConnections
    Metric: DatabaseConnections
    Threshold: 80
    Duration: 5 minutes
    Action: SNS notification

  - Name: HighErrorRate
    Metric: HTTPCode_Target_5XX_Count
    Threshold: 10
    Duration: 1 minute
    Action: SNS notification
```

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] AWS account configured
- [ ] AWS CLI installed and configured
- [ ] Terraform installed
- [ ] Docker installed
- [ ] GitHub repository created
- [ ] GitHub secrets configured
- [ ] Domain registered (optional)
- [ ] SSL certificate created (optional)

### Infrastructure Deployment
- [ ] VPC and subnets created
- [ ] Security groups configured
- [ ] RDS database created
- [ ] ElastiCache cluster created
- [ ] EFS file system created
- [ ] ECR repositories created
- [ ] ECS cluster created
- [ ] Application Load Balancer created
- [ ] Target groups configured

### Application Deployment
- [ ] Docker images built
- [ ] Images pushed to ECR
- [ ] Task definitions registered
- [ ] ECS services created
- [ ] Database migrations run
- [ ] Admin user created
- [ ] Health checks passing

### Post-Deployment
- [ ] DNS configured
- [ ] SSL certificate attached
- [ ] CloudWatch alarms set up
- [ ] Backup strategy implemented
- [ ] Monitoring dashboard created
- [ ] Documentation updated
- [ ] Team trained

---

## 📚 Additional Resources

### AWS Documentation
- [ECS Best Practices](https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/)
- [RDS Best Practices](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_BestPractices.html)
- [VPC Best Practices](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-best-practices.html)

### Terraform Resources
- [AWS Provider Documentation](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Terraform Best Practices](https://www.terraform-best-practices.com/)

### GitHub Actions
- [AWS Actions](https://github.com/aws-actions)
- [ECS Deploy Action](https://github.com/aws-actions/amazon-ecs-deploy-task-definition)

---

**Export Date**: November 2024  
**Version**: 1.0  
**Maintained By**: ApraNova Team
