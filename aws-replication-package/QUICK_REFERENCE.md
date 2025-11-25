# ⚡ Quick Reference Card

**One-page reference for AWS architecture replication**

---

## 🚀 3-Step Deployment

```bash
# 1. Copy package to your repo
cp -r aws-replication-package /path/to/your-repo/

# 2. Configure AWS
aws configure

# 3. Deploy
cd /path/to/your-repo/aws-replication-package
chmod +x replicate-architecture.sh
./replicate-architecture.sh
```

---

## 📁 File Quick Reference

| File | Purpose | When to Use |
|------|---------|-------------|
| `README.md` | Package overview | First time |
| `REPLICATION_INDEX.md` | Navigation guide | Finding info |
| `QUICK_REPLICATION_GUIDE.md` | 30-min start | Quick deploy |
| `REPLICATION_PACKAGE.md` | Complete guide | Detailed deploy |
| `ARCHITECTURE_EXPORT.md` | Technical specs | Customization |
| `replicate-architecture.sh` | Auto deploy | Fast setup |
| `basic-deployment.tf` | Infrastructure | Terraform |
| `deploy-*.yml` | CI/CD | GitHub Actions |
| `*-task-def.json` | ECS config | Container setup |

---

## 💰 Cost Quick Reference

| Service | Monthly | Optimization |
|---------|---------|--------------|
| ECS | $27 | Spot: -$8 |
| RDS | $15 | Reserved: -$6 |
| Redis | $12 | Smaller: -$6 |
| NAT | $33 | Remove: -$33 |
| ALB | $22 | - |
| Other | $21 | Various: -$5 |
| **Total** | **$130** | **→ $75** |

---

## 🔧 Common Commands

### AWS CLI
```bash
# Configure
aws configure

# Check identity
aws sts get-caller-identity

# List resources
aws ecs list-clusters
aws rds describe-db-instances
aws ec2 describe-vpcs
```

### Terraform
```bash
# Initialize
terraform init

# Plan
terraform plan

# Deploy
terraform apply

# Destroy
terraform destroy

# Show state
terraform show
```

### Docker
```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Build
docker build -t image:tag .

# Push
docker push ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/image:tag
```

### ECS
```bash
# List tasks
aws ecs list-tasks --cluster production-cluster

# Describe service
aws ecs describe-services --cluster production-cluster --services backend

# Update service
aws ecs update-service --cluster production-cluster --service backend --force-new-deployment

# View logs
aws logs tail /ecs/backend --follow
```

---

## 🎯 Resource Quick Reference

### Created Resources (31)
- **Networking**: VPC, 4 Subnets, IGW, NAT, 2 Route Tables
- **Compute**: ECS Cluster, 2 Services, 2 Task Definitions
- **Database**: RDS PostgreSQL, ElastiCache Redis
- **Storage**: EFS, 2 ECR Repos
- **Load Balancing**: ALB, 2 Target Groups, Listener, Rule
- **Security**: 4 Security Groups
- **Monitoring**: 2 CloudWatch Log Groups

### Default Configuration
- **Region**: us-east-1
- **VPC CIDR**: 10.0.0.0/16
- **Environment**: production
- **Backend**: 0.5 vCPU, 1 GB RAM
- **Frontend**: 0.25 vCPU, 512 MB RAM
- **Database**: db.t3.micro, 20 GB
- **Redis**: cache.t3.micro

---

## 🔐 Security Quick Reference

### Security Groups
```
ALB SG → Port 80, 443 from 0.0.0.0/0
ECS SG → All ports from ALB SG
RDS SG → Port 5432 from ECS SG
Redis SG → Port 6379 from ECS SG
```

### IAM Roles
- **ecsTaskExecutionRole**: Pull images, write logs
- **ecsTaskRole**: Access EFS, S3

### Encryption
- **In Transit**: TLS 1.2+, EFS encryption
- **At Rest**: RDS encryption (optional), EFS encryption (optional)

---

## 📊 Monitoring Quick Reference

### Key Metrics
- **ECS**: CPUUtilization, MemoryUtilization, TaskCount
- **RDS**: CPUUtilization, DatabaseConnections, FreeStorageSpace
- **ALB**: TargetResponseTime, HTTPCode_5XX, HealthyHostCount
- **Redis**: CPUUtilization, DatabaseMemoryUsage, Evictions

### CloudWatch Logs
- `/ecs/backend` - Backend application logs
- `/ecs/frontend` - Frontend application logs

### Health Checks
- **Backend**: `http://ALB_DNS/api/health`
- **Frontend**: `http://ALB_DNS/`

---

## 🐛 Troubleshooting Quick Reference

| Issue | Check | Solution |
|-------|-------|----------|
| Tasks not starting | CloudWatch logs | Fix env vars |
| 502 Bad Gateway | Target health | Check security groups |
| Can't connect to DB | Security groups | Allow ECS → RDS |
| High costs | Cost Explorer | Remove NAT Gateway |
| Deployment fails | GitHub Actions logs | Check secrets |
| Terraform errors | `terraform plan` | Fix configuration |

### Quick Diagnostics
```bash
# Check ECS tasks
aws ecs describe-tasks --cluster production-cluster --tasks TASK_ARN

# Check target health
aws elbv2 describe-target-health --target-group-arn TG_ARN

# Check logs
aws logs tail /ecs/backend --since 5m

# Check costs
aws ce get-cost-and-usage --time-period Start=2024-11-01,End=2024-11-30 \
  --granularity MONTHLY --metrics BlendedCost
```

---

## 🔄 Update Quick Reference

### Update Backend
```bash
# Via GitHub Actions
# Go to Actions → Deploy Backend → Run workflow

# Via CLI
aws ecs update-service --cluster production-cluster \
  --service backend --force-new-deployment
```

### Update Frontend
```bash
# Via GitHub Actions
# Go to Actions → Deploy Frontend → Run workflow

# Via CLI
aws ecs update-service --cluster production-cluster \
  --service frontend --force-new-deployment
```

### Update Infrastructure
```bash
cd terraform
terraform plan
terraform apply
```

---

## 📞 Support Quick Links

- **AWS Console**: https://console.aws.amazon.com/
- **ECS**: https://console.aws.amazon.com/ecs/
- **RDS**: https://console.aws.amazon.com/rds/
- **CloudWatch**: https://console.aws.amazon.com/cloudwatch/
- **Cost Explorer**: https://console.aws.amazon.com/cost-management/
- **AWS Docs**: https://docs.aws.amazon.com/
- **Terraform Docs**: https://www.terraform.io/docs/

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] AWS CLI configured
- [ ] Terraform installed
- [ ] Docker installed
- [ ] Files copied to repo

### Deployment
- [ ] Terraform apply successful
- [ ] Images pushed to ECR
- [ ] ECS services created
- [ ] Health checks passing

### Post-Deployment
- [ ] Application accessible
- [ ] Logs flowing to CloudWatch
- [ ] Costs within budget
- [ ] Monitoring configured

---

## 🎯 Common Customizations

### Change Region
```hcl
# basic-deployment.tf
variable "aws_region" {
  default = "us-west-2"
}
```

### Upgrade Database
```hcl
# basic-deployment.tf
instance_class = "db.t3.small"
```

### Add HTTPS
```hcl
# basic-deployment.tf
resource "aws_lb_listener" "https" {
  port = "443"
  protocol = "HTTPS"
  certificate_arn = "arn:aws:acm:..."
}
```

### Enable Auto-Scaling
```hcl
# basic-deployment.tf
resource "aws_appautoscaling_target" "backend" {
  max_capacity = 10
  min_capacity = 2
}
```

---

## 📝 Environment Variables Template

```bash
# AWS
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=123456789012

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db
DB_PASSWORD=your-secure-password

# Redis
REDIS_URL=redis://host:6379/0

# Django
DJANGO_SECRET_KEY=your-secret-key
DEBUG=False
ALLOWED_HOSTS=your-alb-dns

# Next.js
NEXT_PUBLIC_API_URL=http://your-alb-dns
```

---

## 🚀 Quick Deploy Commands

```bash
# Full automated deployment
./replicate-architecture.sh

# Manual Terraform only
cd terraform && terraform init && terraform apply

# Build and push images
docker build -t backend . && docker push ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/backend:latest

# Create ECS service
aws ecs create-service --cluster production-cluster --service-name backend \
  --task-definition backend --desired-count 1 --launch-type FARGATE

# Run migrations
aws ecs execute-command --cluster production-cluster --task TASK_ARN \
  --container backend --interactive --command "python manage.py migrate"
```

---

**Print this page for quick reference during deployment! 📄**
