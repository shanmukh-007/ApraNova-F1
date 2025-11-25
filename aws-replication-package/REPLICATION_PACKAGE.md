# 🚀 AWS Architecture & CI/CD Replication Package

This document contains everything you need to replicate the AWS architecture and CI/CD setup in your other repository.

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [File Structure](#file-structure)
4. [Step-by-Step Setup](#step-by-step-setup)
5. [Configuration Files](#configuration-files)
6. [Cost Estimates](#cost-estimates)

---

## 🏗️ Architecture Overview

### Services Used:
- **VPC**: Isolated network (10.0.0.0/16)
- **ECS Fargate**: Container orchestration
- **RDS PostgreSQL**: Database (db.t3.micro)
- **ElastiCache Redis**: Caching (cache.t3.micro)
- **Application Load Balancer**: Traffic routing
- **EFS**: Persistent file storage
- **ECR**: Container registry
- **CloudWatch**: Logging and monitoring
- **NAT Gateway**: Outbound internet access

### Architecture Diagram:
```
Internet → ALB → ECS (Backend/Frontend) → RDS/Redis/EFS
           ↓
       CloudWatch
```

**Monthly Cost**: ~$134 (with NAT Gateway) or ~$100 (without NAT Gateway)

---

## ✅ Prerequisites

### 1. AWS Account Setup
- AWS Account with admin access
- AWS CLI installed and configured
- Account ID: (will be your own)
- Region: us-east-1 (or your preferred region)

### 2. GitHub Repository Setup
- GitHub repository with your code
- GitHub Actions enabled
- Repository secrets configured

### 3. Local Tools
- Docker installed
- Terraform installed (v1.0+)
- AWS CLI v2
- Git

---

## 📁 File Structure

Copy these files to your repository:

```
your-repo/
├── .github/
│   └── workflows/
│       ├── deploy-backend.yml
│       └── deploy-frontend.yml
├── terraform/
│   └── basic-deployment.tf
├── backend/
│   ├── Dockerfile
│   └── (your backend code)
├── frontend/
│   ├── Dockerfile.simple
│   └── (your frontend code)
├── backend-task-def.json
├── frontend-task-def.json
├── deploy-basic-aws.sh
└── .env.example
```

---

## 🔧 Step-by-Step Setup

### Step 1: Configure AWS Credentials

```bash
# Install AWS CLI if not already installed
# macOS
brew install awscli

# Configure credentials
aws configure
# Enter your:
# - AWS Access Key ID
# - AWS Secret Access Key
# - Default region: us-east-1
# - Default output format: json

# Verify
aws sts get-caller-identity
```

### Step 2: Set Up GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:
- `AWS_ACCESS_KEY_ID`: Your AWS access key
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret key

### Step 3: Prepare Environment Variables

Create `.env` file with your configuration:

```bash
# Database
DB_PASSWORD=your-secure-password-here
DB_NAME=apranova_db
DB_USER=apranova_admin

# AWS
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=your-account-id

# Application
DJANGO_SECRET_KEY=your-django-secret-key
STRIPE_SECRET_KEY=your-stripe-key
```

### Step 4: Deploy Infrastructure with Terraform

```bash
# Navigate to terraform directory
cd terraform

# Initialize Terraform
terraform init

# Create terraform.tfvars
cat > terraform.tfvars <<EOF
aws_region = "us-east-1"
environment = "production"
db_password = "your-secure-password"
EOF

# Preview changes
terraform plan -var-file=terraform.tfvars

# Deploy (this takes 10-15 minutes)
terraform apply -var-file=terraform.tfvars

# Save outputs
terraform output > ../terraform-outputs.txt
```

### Step 5: Build and Push Docker Images

```bash
# Get your AWS account ID
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
export AWS_REGION=us-east-1

# Login to ECR
aws ecr get-login-password --region $AWS_REGION | \
    docker login --username AWS --password-stdin \
    $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Create ECR repositories
aws ecr create-repository --repository-name apranova/backend --region $AWS_REGION
aws ecr create-repository --repository-name apranova/frontend --region $AWS_REGION

# Build and push backend
cd backend
docker build -t $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/apranova/backend:latest .
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/apranova/backend:latest

# Build and push frontend
cd ../frontend
docker build -f Dockerfile.simple -t $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/apranova/frontend:latest .
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/apranova/frontend:latest
```

### Step 6: Create ECS Task Definitions

Update `backend-task-def.json` with your values:

```json
{
  "family": "backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::YOUR_ACCOUNT_ID:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/apranova/backend:latest",
      "essential": true,
      "portMappings": [
        {
          "containerPort": 8000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "DATABASE_URL",
          "value": "postgresql://apranova_admin:YOUR_PASSWORD@YOUR_RDS_ENDPOINT:5432/apranova_db"
        },
        {
          "name": "REDIS_URL",
          "value": "redis://YOUR_REDIS_ENDPOINT:6379/0"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs",
          "awslogs-create-group": "true"
        }
      }
    }
  ]
}
```

Register task definitions:

```bash
# Create IAM role for ECS tasks (if not exists)
aws iam create-role --role-name ecsTaskExecutionRole \
    --assume-role-policy-document file://ecs-trust-policy.json

aws iam attach-role-policy --role-name ecsTaskExecutionRole \
    --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy

# Register task definitions
aws ecs register-task-definition --cli-input-json file://backend-task-def.json
aws ecs register-task-definition --cli-input-json file://frontend-task-def.json
```

### Step 7: Create ECS Services

```bash
# Get subnet and security group IDs from Terraform output
export PRIVATE_SUBNET_1=$(terraform output -raw private_subnet_ids | jq -r '.[0]')
export PRIVATE_SUBNET_2=$(terraform output -raw private_subnet_ids | jq -r '.[1]')
export ECS_SG=$(terraform output -raw ecs_security_group_id)
export BACKEND_TG=$(terraform output -raw backend_target_group_arn)
export FRONTEND_TG=$(terraform output -raw frontend_target_group_arn)

# Create backend service
aws ecs create-service \
    --cluster production-cluster \
    --service-name backend \
    --task-definition backend \
    --desired-count 1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[$PRIVATE_SUBNET_1,$PRIVATE_SUBNET_2],securityGroups=[$ECS_SG],assignPublicIp=DISABLED}" \
    --load-balancers "targetGroupArn=$BACKEND_TG,containerName=backend,containerPort=8000"

# Create frontend service
aws ecs create-service \
    --cluster production-cluster \
    --service-name frontend \
    --task-definition frontend \
    --desired-count 1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[$PRIVATE_SUBNET_1,$PRIVATE_SUBNET_2],securityGroups=[$ECS_SG],assignPublicIp=DISABLED}" \
    --load-balancers "targetGroupArn=$FRONTEND_TG,containerName=frontend,containerPort=3000"
```

### Step 8: Run Database Migrations

```bash
# Get the task ARN
TASK_ARN=$(aws ecs list-tasks --cluster production-cluster --service-name backend --query 'taskArns[0]' --output text)

# Run migrations
aws ecs execute-command \
    --cluster production-cluster \
    --task $TASK_ARN \
    --container backend \
    --interactive \
    --command "python manage.py migrate"
```

### Step 9: Test Your Deployment

```bash
# Get ALB DNS name
ALB_DNS=$(terraform output -raw alb_dns_name)

# Test backend
curl http://$ALB_DNS/api/health

# Test frontend
curl http://$ALB_DNS/

# View in browser
echo "Frontend: http://$ALB_DNS"
echo "Backend API: http://$ALB_DNS/api/"
```

### Step 10: Set Up CI/CD

The GitHub Actions workflows are already configured. To deploy:

1. Go to your GitHub repository
2. Click "Actions" tab
3. Select "Deploy Backend to AWS ECS" or "Deploy Frontend to AWS ECS"
4. Click "Run workflow"
5. Wait for deployment to complete (~5 minutes)

---

## 📄 Configuration Files

### 1. Terraform Configuration (`terraform/basic-deployment.tf`)

See the full file in the repository. Key resources:
- VPC with public/private subnets
- Internet Gateway and NAT Gateway
- Security Groups
- RDS PostgreSQL
- ElastiCache Redis
- EFS File System
- ECS Cluster
- Application Load Balancer

### 2. GitHub Actions Workflows

**Backend Deployment** (`.github/workflows/deploy-backend.yml`):
- Builds Docker image
- Pushes to ECR
- Updates ECS service

**Frontend Deployment** (`.github/workflows/deploy-frontend.yml`):
- Builds Docker image
- Pushes to ECR
- Updates ECS service

### 3. ECS Task Definitions

**Backend** (`backend-task-def.json`):
- 0.5 vCPU, 1 GB RAM
- Port 8000
- Environment variables for database, redis

**Frontend** (`frontend-task-def.json`):
- 0.25 vCPU, 512 MB RAM
- Port 3000
- Environment variables for API URL

---

## 💰 Cost Estimates

### Monthly Costs (us-east-1)

| Service | Configuration | Monthly Cost |
|---------|--------------|--------------|
| ECS Fargate | 2 tasks (0.75 vCPU, 1.5 GB) | $40 |
| RDS PostgreSQL | db.t3.micro, 20 GB | $15 |
| ElastiCache Redis | cache.t3.micro | $12 |
| NAT Gateway | 1 gateway + data transfer | $33 |
| Application Load Balancer | 1 ALB | $16 |
| EFS | 10 GB storage | $3 |
| ECR | 2 repositories, 1 GB | $1 |
| CloudWatch | Logs and metrics | $5 |
| Data Transfer | Outbound | $5 |
| **TOTAL** | | **~$130/month** |

### Cost Optimization Options:

1. **Remove NAT Gateway** (-$33/month)
   - Use VPC Endpoints for AWS services
   - Trade-off: No outbound internet from private subnets

2. **Use Fargate Spot** (-30% on compute)
   - Save ~$12/month on ECS
   - Trade-off: Possible interruptions

3. **Reserved Instances** (-40% on RDS)
   - Save ~$6/month with 1-year commitment
   - Trade-off: Upfront payment

4. **Reduce Task Count** (development only)
   - Run 1 backend task instead of 2
   - Save ~$20/month
   - Trade-off: No high availability

---

## 🔐 Security Checklist

- [ ] Enable HTTPS with ACM certificate
- [ ] Configure AWS WAF for ALB
- [ ] Enable RDS encryption at rest
- [ ] Enable EFS encryption
- [ ] Set up CloudTrail for audit logs
- [ ] Configure VPC Flow Logs
- [ ] Enable GuardDuty for threat detection
- [ ] Use Secrets Manager for sensitive data
- [ ] Implement least-privilege IAM policies
- [ ] Enable MFA for AWS root account
- [ ] Set up billing alerts

---

## 🚨 Troubleshooting

### Issue: ECS tasks not starting
**Solution**: Check CloudWatch logs at `/ecs/backend` or `/ecs/frontend`

### Issue: Can't connect to RDS
**Solution**: Verify security group allows traffic from ECS security group

### Issue: 502 Bad Gateway from ALB
**Solution**: Check target group health checks and ECS task status

### Issue: High costs
**Solution**: Review CloudWatch metrics and consider removing NAT Gateway

---

## 📚 Additional Resources

- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [GitHub Actions for AWS](https://github.com/aws-actions)
- [AWS Cost Calculator](https://calculator.aws/)

---

## 🎯 Next Steps

After deployment:

1. **Set up custom domain**
   - Register domain in Route 53
   - Create ACM certificate
   - Update ALB listener for HTTPS

2. **Enable monitoring**
   - Set up CloudWatch dashboards
   - Configure alarms for errors
   - Enable X-Ray tracing

3. **Implement backups**
   - Enable RDS automated backups
   - Set up EFS backup with AWS Backup
   - Configure snapshot lifecycle

4. **Scale for production**
   - Increase task counts
   - Enable auto-scaling
   - Add read replicas for RDS

---

**Created**: November 2024  
**Last Updated**: November 2024  
**Version**: 1.0
