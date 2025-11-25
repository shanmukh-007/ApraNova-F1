# Production Deployment Guide

## Overview
Complete guide to deploy ApraNova to AWS production environment.

## Prerequisites ✓
- [x] AWS Account: 322388074242
- [x] AWS CLI: v2.32.3
- [x] Terraform: v1.5.7
- [x] Docker: Running
- [x] Local services: All healthy

## Deployment Options

### Option 1: Automated Deployment (Recommended)
**Time**: 30-40 minutes

```bash
./deploy-to-aws.sh
```

This script will:
1. Create ECR repositories
2. Deploy infrastructure with Terraform
3. Build and push Docker images
4. Create ECS task definitions
5. Deploy ECS services

### Option 2: Manual Step-by-Step

#### Step 1: Initialize Terraform
```bash
cd terraform
terraform init
```

#### Step 2: Create Variables File
```bash
cat > terraform.tfvars <<EOF
aws_region = "us-east-1"
environment = "production"
db_password = "YOUR_SECURE_PASSWORD"
EOF
```

#### Step 3: Deploy Infrastructure
```bash
terraform plan -var-file=terraform.tfvars
terraform apply -var-file=terraform.tfvars
```

#### Step 4: Create ECR Repositories
```bash
aws ecr create-repository --repository-name apranova/backend
aws ecr create-repository --repository-name apranova/frontend
```

#### Step 5: Build and Push Images
```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin 322388074242.dkr.ecr.us-east-1.amazonaws.com

# Build and push backend
cd backend
docker build -t 322388074242.dkr.ecr.us-east-1.amazonaws.com/apranova/backend:latest .
docker push 322388074242.dkr.ecr.us-east-1.amazonaws.com/apranova/backend:latest

# Build and push frontend
cd ../frontend
docker build -t 322388074242.dkr.ecr.us-east-1.amazonaws.com/apranova/frontend:latest .
docker push 322388074242.dkr.ecr.us-east-1.amazonaws.com/apranova/frontend:latest
```

#### Step 6: Create ECS Services
See task definitions in `backend-task-def.json` and `frontend-task-def.json`

## What Gets Created

### AWS Resources (31 total)
- **VPC**: 1 VPC with DNS enabled
- **Subnets**: 2 public + 2 private across 2 AZs
- **Networking**: Internet Gateway, NAT Gateway, Route Tables
- **Security Groups**: ALB, ECS, RDS, Redis
- **Load Balancer**: Application Load Balancer with target groups
- **ECS**: Cluster with 2 Fargate services
- **Database**: RDS PostgreSQL (db.t3.micro)
- **Cache**: ElastiCache Redis (cache.t3.micro)
- **Storage**: EFS file system
- **Registry**: 2 ECR repositories
- **Monitoring**: CloudWatch log groups

### Cost Breakdown
```
Monthly Costs:
├─ ECS Fargate:        $27  (2 tasks @ 0.5 vCPU, 1GB RAM)
├─ RDS PostgreSQL:     $15  (db.t3.micro)
├─ ElastiCache Redis:  $12  (cache.t3.micro)
├─ NAT Gateway:        $33  (1 gateway + data transfer)
├─ Load Balancer:      $22  (1 ALB)
├─ EFS:                $3   (10 GB storage)
├─ ECR:                $1   (1 GB images)
├─ CloudWatch:         $3   (logs + metrics)
├─ Data Transfer:      $5   (outbound)
└─ Other:              $9   (misc)
────────────────────────────
TOTAL:                 $130/month
```

### Cost Optimization Options
- Remove NAT Gateway: -$33 (use VPC endpoints)
- Use Fargate Spot: -$8 (70% discount)
- Reduce task count: -$14 (1 backend task)
- **Optimized Total**: ~$75/month

## Post-Deployment Steps

### 1. Run Database Migrations
```bash
# Get backend task ID
TASK_ID=$(aws ecs list-tasks --cluster production-cluster --service-name backend --query 'taskArns[0]' --output text)

# Run migrations
aws ecs execute-command \
  --cluster production-cluster \
  --task $TASK_ID \
  --container backend \
  --interactive \
  --command "python manage.py migrate"
```

### 2. Create Superuser
```bash
aws ecs execute-command \
  --cluster production-cluster \
  --task $TASK_ID \
  --container backend \
  --interactive \
  --command "python manage.py createsuperuser"
```

### 3. Verify Deployment
```bash
# Get ALB DNS
ALB_DNS=$(cd terraform && terraform output -raw alb_dns_name)

# Test backend health
curl http://$ALB_DNS/api/health

# Test frontend
curl -I http://$ALB_DNS/

# Check ECS services
aws ecs describe-services --cluster production-cluster --services backend frontend
```

### 4. Monitor Logs
```bash
# Backend logs
aws logs tail /ecs/backend --follow

# Frontend logs
aws logs tail /ecs/frontend --follow
```

## Troubleshooting

### Services Not Starting
```bash
# Check task status
aws ecs describe-tasks --cluster production-cluster --tasks TASK_ID

# Check logs
aws logs tail /ecs/backend --since 10m
```

### 502 Bad Gateway
```bash
# Check target health
aws elbv2 describe-target-health --target-group-arn TARGET_GROUP_ARN

# Verify security groups allow traffic
aws ec2 describe-security-groups --group-ids SG_ID
```

### Database Connection Issues
```bash
# Verify RDS is available
aws rds describe-db-instances --db-instance-identifier production-apranova-db

# Check security group rules
aws ec2 describe-security-groups --filters "Name=group-name,Values=production-rds-sg"
```

## Monitoring

### CloudWatch Dashboards
```bash
# View metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name CPUUtilization \
  --dimensions Name=ServiceName,Value=backend \
  --start-time 2024-11-25T00:00:00Z \
  --end-time 2024-11-25T23:59:59Z \
  --period 3600 \
  --statistics Average
```

### Cost Monitoring
```bash
# Check current month costs
aws ce get-cost-and-usage \
  --time-period Start=2024-11-01,End=2024-11-30 \
  --granularity MONTHLY \
  --metrics BlendedCost
```

## Scaling

### Increase Task Count
```bash
aws ecs update-service \
  --cluster production-cluster \
  --service backend \
  --desired-count 2
```

### Enable Auto-Scaling
```bash
# Register scalable target
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/production-cluster/backend \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 1 \
  --max-capacity 10

# Create scaling policy
aws application-autoscaling put-scaling-policy \
  --service-namespace ecs \
  --resource-id service/production-cluster/backend \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-name cpu-scaling \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration file://scaling-policy.json
```

## Security Enhancements

### Add HTTPS
1. Request ACM certificate
2. Add HTTPS listener to ALB
3. Redirect HTTP to HTTPS

### Enable WAF
```bash
aws wafv2 create-web-acl \
  --name production-waf \
  --scope REGIONAL \
  --default-action Allow={} \
  --rules file://waf-rules.json
```

### Enable CloudTrail
```bash
aws cloudtrail create-trail \
  --name production-trail \
  --s3-bucket-name my-cloudtrail-bucket
```

## Backup Strategy

### RDS Automated Backups
- Enabled by default
- 7-day retention
- Daily snapshots

### Manual Snapshot
```bash
aws rds create-db-snapshot \
  --db-instance-identifier production-apranova-db \
  --db-snapshot-identifier manual-snapshot-$(date +%Y%m%d)
```

## Rollback Procedure

### Rollback to Previous Task Definition
```bash
aws ecs update-service \
  --cluster production-cluster \
  --service backend \
  --task-definition backend:PREVIOUS_REVISION
```

### Destroy Infrastructure
```bash
cd terraform
terraform destroy -var-file=terraform.tfvars
```

## Next Steps

1. **Configure Domain**: Point your domain to ALB DNS
2. **Add SSL**: Request ACM certificate and configure HTTPS
3. **Set Up CI/CD**: Configure GitHub Actions for automated deployments
4. **Enable Monitoring**: Set up CloudWatch alarms and dashboards
5. **Implement Backups**: Configure automated backup strategy
6. **Security Hardening**: Enable WAF, CloudTrail, and GuardDuty

## Support

- **AWS Documentation**: https://docs.aws.amazon.com/
- **Terraform Docs**: https://registry.terraform.io/providers/hashicorp/aws/latest/docs
- **ECS Best Practices**: https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/

## Quick Reference

```bash
# Check deployment status
aws ecs describe-services --cluster production-cluster --services backend frontend

# View logs
aws logs tail /ecs/backend --follow

# Update service
aws ecs update-service --cluster production-cluster --service backend --force-new-deployment

# Check costs
aws ce get-cost-and-usage --time-period Start=2024-11-01,End=2024-11-30 --granularity MONTHLY --metrics BlendedCost

# Scale service
aws ecs update-service --cluster production-cluster --service backend --desired-count 2
```

---

**Deployment Time**: 30-40 minutes  
**Monthly Cost**: ~$130 (optimizable to ~$75)  
**Maintenance**: Low  
**Scalability**: High
