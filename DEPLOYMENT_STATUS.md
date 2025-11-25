# AWS Deployment Status

## ✅ Completed Steps

### 1. Prerequisites Verified
- AWS Account: 322388074242
- AWS CLI: v2.32.3
- Terraform: v1.5.7
- Docker: Running
- Region: us-east-1

### 2. ECR Repositories Created
- ✅ `322388074242.dkr.ecr.us-east-1.amazonaws.com/apranova/backend`
- ✅ `322388074242.dkr.ecr.us-east-1.amazonaws.com/apranova/frontend`

### 3. Terraform Configuration Ready
- ✅ `terraform/main.tf` - Complete infrastructure definition
- ✅ `terraform/terraform.tfvars` - Variables configured
- ✅ Terraform initialized successfully

## 🔄 Next Steps

### Option 1: Continue with Automated Script
```bash
./deploy-to-aws.sh
```

### Option 2: Manual Deployment (Recommended for Control)

#### Step 1: Deploy Infrastructure (15 min)
```bash
cd terraform
terraform plan -var-file=terraform.tfvars
terraform apply -var-file=terraform.tfvars
```

This will create:
- VPC with public/private subnets
- RDS PostgreSQL database
- ElastiCache Redis
- Application Load Balancer
- ECS Cluster
- Security groups
- EFS file system

#### Step 2: Build and Push Docker Images (10 min)
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

#### Step 3: Create IAM Role (if needed)
```bash
# Check if role exists
aws iam get-role --role-name ecsTaskExecutionRole 2>/dev/null || \
aws iam create-role --role-name ecsTaskExecutionRole \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {"Service": "ecs-tasks.amazonaws.com"},
      "Action": "sts:AssumeRole"
    }]
  }'

# Attach policy
aws iam attach-role-policy --role-name ecsTaskExecutionRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy
```

#### Step 4: Get Infrastructure Outputs
```bash
cd terraform
export ALB_DNS=$(terraform output -raw alb_dns_name)
export RDS_ENDPOINT=$(terraform output -raw rds_endpoint)
export REDIS_ENDPOINT=$(terraform output -raw redis_endpoint)
export ECS_CLUSTER=$(terraform output -raw ecs_cluster_name)
export VPC_ID=$(terraform output -raw vpc_id)
export ECS_SG=$(terraform output -raw ecs_security_group_id)

echo "ALB DNS: $ALB_DNS"
echo "RDS: $RDS_ENDPOINT"
echo "Redis: $REDIS_ENDPOINT"
```

#### Step 5: Create Task Definitions
```bash
cd ..

# Backend task definition
cat > backend-task-def.json <<EOF
{
  "family": "backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::322388074242:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "322388074242.dkr.ecr.us-east-1.amazonaws.com/apranova/backend:latest",
      "essential": true,
      "portMappings": [{"containerPort": 8000, "protocol": "tcp"}],
      "environment": [
        {"name": "DATABASE_URL", "value": "postgresql://apranova_admin:ApraNova2024Secure!@\${RDS_ENDPOINT}/apranova_db"},
        {"name": "REDIS_URL", "value": "redis://\${REDIS_ENDPOINT}:6379/0"},
        {"name": "DEBUG", "value": "False"},
        {"name": "ALLOWED_HOSTS", "value": "\${ALB_DNS},localhost,*"}
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
EOF

# Frontend task definition
cat > frontend-task-def.json <<EOF
{
  "family": "frontend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::322388074242:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "frontend",
      "image": "322388074242.dkr.ecr.us-east-1.amazonaws.com/apranova/frontend:latest",
      "essential": true,
      "portMappings": [{"containerPort": 3000, "protocol": "tcp"}],
      "environment": [
        {"name": "NEXT_PUBLIC_API_URL", "value": "http://\${ALB_DNS}"},
        {"name": "BACKEND_URL", "value": "http://\${ALB_DNS}"},
        {"name": "NODE_ENV", "value": "production"}
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/frontend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs",
          "awslogs-create-group": "true"
        }
      }
    }
  ]
}
EOF

# Register task definitions
aws ecs register-task-definition --cli-input-json file://backend-task-def.json
aws ecs register-task-definition --cli-input-json file://frontend-task-def.json
```

#### Step 6: Create ECS Services
```bash
# Get target group ARNs
BACKEND_TG_ARN=$(aws elbv2 describe-target-groups --names production-backend-tg --query 'TargetGroups[0].TargetGroupArn' --output text)
FRONTEND_TG_ARN=$(aws elbv2 describe-target-groups --names production-frontend-tg --query 'TargetGroups[0].TargetGroupArn' --output text)

# Get private subnet IDs
PRIVATE_SUBNETS=$(cd terraform && terraform output -json private_subnet_ids | jq -r '.[]' | tr '\n' ',' | sed 's/,$//')

# Create backend service
aws ecs create-service \
  --cluster $ECS_CLUSTER \
  --service-name backend \
  --task-definition backend \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[$PRIVATE_SUBNETS],securityGroups=[$ECS_SG],assignPublicIp=DISABLED}" \
  --load-balancers "targetGroupArn=$BACKEND_TG_ARN,containerName=backend,containerPort=8000"

# Create frontend service
aws ecs create-service \
  --cluster $ECS_CLUSTER \
  --service-name frontend \
  --task-definition frontend \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[$PRIVATE_SUBNETS],securityGroups=[$ECS_SG],assignPublicIp=DISABLED}" \
  --load-balancers "targetGroupArn=$FRONTEND_TG_ARN,containerName=frontend,containerPort=3000"
```

#### Step 7: Verify Deployment
```bash
# Check service status
aws ecs describe-services --cluster $ECS_CLUSTER --services backend frontend

# Wait for services to be healthy (5-10 minutes)
aws ecs wait services-stable --cluster $ECS_CLUSTER --services backend frontend

# Test endpoints
curl http://$ALB_DNS/api/health
curl -I http://$ALB_DNS/

# View logs
aws logs tail /ecs/backend --follow
```

## 📊 Resources Created

When deployment completes, you'll have:

### Networking
- 1 VPC (10.0.0.0/16)
- 2 Public subnets
- 2 Private subnets
- 1 Internet Gateway
- 1 NAT Gateway
- Route tables

### Compute
- 1 ECS Cluster
- 2 ECS Services (backend, frontend)
- 2 Fargate tasks

### Database
- RDS PostgreSQL (db.t3.micro)
- ElastiCache Redis (cache.t3.micro)

### Load Balancing
- Application Load Balancer
- 2 Target Groups
- HTTP listener with routing rules

### Storage
- EFS file system
- 2 ECR repositories

### Security
- 4 Security groups
- IAM execution role

## 💰 Cost Estimate

**Monthly**: ~$97 (NAT Gateway removed!)
- ECS Fargate: $27
- RDS: $15
- Redis: $12
- ~~NAT Gateway: $33~~ (removed)
- ALB: $22
- Other: $21

## 🎯 Current Status

**Ready for**: Terraform apply

**Next action**: Run `terraform apply` in the terraform directory

## 📝 Notes

- Database password is set in `terraform/terraform.tfvars`
- All configuration files are ready
- ECR repositories are created
- Terraform is initialized

## 🆘 If You Need to Start Over

```bash
# Destroy infrastructure
cd terraform
terraform destroy -var-file=terraform.tfvars

# Delete ECR repositories
aws ecr delete-repository --repository-name apranova/backend --force
aws ecr delete-repository --repository-name apranova/frontend --force
```
