#!/bin/bash
# ApraNova AWS Production Deployment Script
# Automated deployment to AWS ECS with Fargate

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}ApraNova AWS Production Deployment${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Configuration
AWS_REGION="us-east-1"
ENVIRONMENT="production"
REPO_NAME="apranova"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

echo -e "${GREEN}✓ AWS Account: $AWS_ACCOUNT_ID${NC}"
echo -e "${GREEN}✓ Region: $AWS_REGION${NC}"
echo ""

# Get database password
read -p "Enter database password (min 8 characters): " -s DB_PASSWORD
echo ""

if [ ${#DB_PASSWORD} -lt 8 ]; then
    echo -e "${RED}❌ Password must be at least 8 characters${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}This will create AWS resources costing ~$130/month${NC}"
read -p "Continue? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo -e "${RED}Deployment cancelled${NC}"
    exit 0
fi

# Step 1: Create ECR repositories
echo ""
echo -e "${GREEN}Step 1: Creating ECR repositories...${NC}"
for repo in backend frontend; do
    if aws ecr describe-repositories --repository-names $REPO_NAME/$repo --region $AWS_REGION 2>/dev/null; then
        echo -e "${YELLOW}Repository $REPO_NAME/$repo already exists${NC}"
    else
        aws ecr create-repository --repository-name $REPO_NAME/$repo --region $AWS_REGION
        echo -e "${GREEN}✓ Created $REPO_NAME/$repo${NC}"
    fi
done

# Step 2: Deploy infrastructure
echo ""
echo -e "${GREEN}Step 2: Deploying infrastructure with Terraform...${NC}"
cd terraform

# Initialize Terraform
terraform init

# Create tfvars file
cat > terraform.tfvars <<EOF
aws_region = "$AWS_REGION"
environment = "$ENVIRONMENT"
db_password = "$DB_PASSWORD"
EOF

# Plan
terraform plan -var-file=terraform.tfvars -out=tfplan

echo ""
read -p "Review the plan above. Continue with apply? (yes/no): " TERRAFORM_CONFIRM
if [ "$TERRAFORM_CONFIRM" != "yes" ]; then
    echo -e "${RED}Deployment cancelled${NC}"
    cd ..
    exit 0
fi

# Apply
terraform apply tfplan

# Get outputs
ALB_DNS=$(terraform output -raw alb_dns_name)
RDS_ENDPOINT=$(terraform output -raw rds_endpoint)
REDIS_ENDPOINT=$(terraform output -raw redis_endpoint)
ECS_CLUSTER=$(terraform output -raw ecs_cluster_name)
VPC_ID=$(terraform output -raw vpc_id)
PRIVATE_SUBNETS=$(terraform output -json private_subnet_ids | jq -r '.[]' | tr '\n' ',' | sed 's/,$//')
ECS_SG=$(terraform output -raw ecs_security_group_id)

cd ..

echo ""
echo -e "${GREEN}✓ Infrastructure deployed${NC}"
echo -e "${GREEN}  ALB DNS: $ALB_DNS${NC}"
echo -e "${GREEN}  RDS: $RDS_ENDPOINT${NC}"
echo -e "${GREEN}  Redis: $REDIS_ENDPOINT${NC}"

# Step 3: Build and push Docker images
echo ""
echo -e "${GREEN}Step 3: Building and pushing Docker images...${NC}"

# Login to ECR
aws ecr get-login-password --region $AWS_REGION | \
    docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Build and push backend
echo -e "${YELLOW}Building backend...${NC}"
cd backend
docker build -t $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$REPO_NAME/backend:latest .
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$REPO_NAME/backend:latest
cd ..
echo -e "${GREEN}✓ Backend image pushed${NC}"

# Build and push frontend
echo -e "${YELLOW}Building frontend...${NC}"
cd frontend
docker build -t $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$REPO_NAME/frontend:latest .
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$REPO_NAME/frontend:latest
cd ..
echo -e "${GREEN}✓ Frontend image pushed${NC}"

# Step 4: Create task definitions
echo ""
echo -e "${GREEN}Step 4: Creating ECS task definitions...${NC}"

# Create execution role if it doesn't exist
if ! aws iam get-role --role-name ecsTaskExecutionRole 2>/dev/null; then
    echo -e "${YELLOW}Creating ecsTaskExecutionRole...${NC}"
    aws iam create-role --role-name ecsTaskExecutionRole \
        --assume-role-policy-document '{
          "Version": "2012-10-17",
          "Statement": [{
            "Effect": "Allow",
            "Principal": {"Service": "ecs-tasks.amazonaws.com"},
            "Action": "sts:AssumeRole"
          }]
        }'
    aws iam attach-role-policy --role-name ecsTaskExecutionRole \
        --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy
    echo -e "${GREEN}✓ Created ecsTaskExecutionRole${NC}"
fi

# Backend task definition
cat > backend-task-def.json <<EOF
{
  "family": "backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::$AWS_ACCOUNT_ID:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$REPO_NAME/backend:latest",
      "essential": true,
      "portMappings": [{"containerPort": 8000, "protocol": "tcp"}],
      "environment": [
        {"name": "DATABASE_URL", "value": "postgresql://apranova_admin:$DB_PASSWORD@$RDS_ENDPOINT/apranova_db"},
        {"name": "REDIS_URL", "value": "redis://$REDIS_ENDPOINT:6379/0"},
        {"name": "DEBUG", "value": "False"},
        {"name": "ALLOWED_HOSTS", "value": "$ALB_DNS,localhost,*"}
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/backend",
          "awslogs-region": "$AWS_REGION",
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
  "executionRoleArn": "arn:aws:iam::$AWS_ACCOUNT_ID:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "frontend",
      "image": "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$REPO_NAME/frontend:latest",
      "essential": true,
      "portMappings": [{"containerPort": 3000, "protocol": "tcp"}],
      "environment": [
        {"name": "NEXT_PUBLIC_API_URL", "value": "http://$ALB_DNS"},
        {"name": "BACKEND_URL", "value": "http://$ALB_DNS"},
        {"name": "NODE_ENV", "value": "production"}
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/frontend",
          "awslogs-region": "$AWS_REGION",
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
echo -e "${GREEN}✓ Task definitions registered${NC}"

# Step 5: Create ECS services
echo ""
echo -e "${GREEN}Step 5: Creating ECS services...${NC}"

# Get target group ARNs
BACKEND_TG_ARN=$(aws elbv2 describe-target-groups --names production-backend-tg --query 'TargetGroups[0].TargetGroupArn' --output text)
FRONTEND_TG_ARN=$(aws elbv2 describe-target-groups --names production-frontend-tg --query 'TargetGroups[0].TargetGroupArn' --output text)

# Create backend service
aws ecs create-service \
    --cluster $ECS_CLUSTER \
    --service-name backend \
    --task-definition backend \
    --desired-count 1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[$PRIVATE_SUBNETS],securityGroups=[$ECS_SG],assignPublicIp=DISABLED}" \
    --load-balancers "targetGroupArn=$BACKEND_TG_ARN,containerName=backend,containerPort=8000" \
    || echo -e "${YELLOW}Backend service may already exist${NC}"

# Create frontend service
aws ecs create-service \
    --cluster $ECS_CLUSTER \
    --service-name frontend \
    --task-definition frontend \
    --desired-count 1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[$PRIVATE_SUBNETS],securityGroups=[$ECS_SG],assignPublicIp=DISABLED}" \
    --load-balancers "targetGroupArn=$FRONTEND_TG_ARN,containerName=frontend,containerPort=3000" \
    || echo -e "${YELLOW}Frontend service may already exist${NC}"

echo -e "${GREEN}✓ ECS services created${NC}"

# Step 6: Summary
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Deployment Complete!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${GREEN}Your application is deploying to AWS!${NC}"
echo ""
echo "Application URL: http://$ALB_DNS"
echo "Backend API: http://$ALB_DNS/api/"
echo "Admin Panel: http://$ALB_DNS/admin/"
echo ""
echo "Database: $RDS_ENDPOINT"
echo "Redis: $REDIS_ENDPOINT"
echo ""
echo -e "${YELLOW}Note: It may take 5-10 minutes for services to become healthy${NC}"
echo ""
echo "Check status:"
echo "  aws ecs describe-services --cluster $ECS_CLUSTER --services backend frontend"
echo ""
echo "View logs:"
echo "  aws logs tail /ecs/backend --follow"
echo "  aws logs tail /ecs/frontend --follow"
echo ""
echo -e "${YELLOW}Estimated monthly cost: ~\$130${NC}"
echo ""
