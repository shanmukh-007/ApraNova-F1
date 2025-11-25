#!/bin/bash
# AWS Architecture Replication Script
# This script helps you replicate the AWS architecture in a new repository

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}AWS Architecture Replication Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

if ! command_exists aws; then
    echo -e "${RED}❌ AWS CLI not found. Please install it first.${NC}"
    exit 1
fi

if ! command_exists terraform; then
    echo -e "${RED}❌ Terraform not found. Please install it first.${NC}"
    exit 1
fi

if ! command_exists docker; then
    echo -e "${RED}❌ Docker not found. Please install it first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ All prerequisites met${NC}"
echo ""

# Get AWS account info
echo -e "${YELLOW}Checking AWS credentials...${NC}"
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured!${NC}"
    echo "Run: aws configure"
    exit 1
fi

AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=${AWS_REGION:-us-east-1}

echo -e "${GREEN}✓ AWS Account: $AWS_ACCOUNT_ID${NC}"
echo -e "${GREEN}✓ Region: $AWS_REGION${NC}"
echo ""

# Get configuration
echo -e "${YELLOW}Configuration:${NC}"
echo ""

read -p "Enter environment name (default: production): " ENVIRONMENT
ENVIRONMENT=${ENVIRONMENT:-production}

read -p "Enter database password: " -s DB_PASSWORD
echo ""

if [ -z "$DB_PASSWORD" ]; then
    echo -e "${RED}❌ Database password is required${NC}"
    exit 1
fi

read -p "Enter your repository name (e.g., apranova): " REPO_NAME
if [ -z "$REPO_NAME" ]; then
    echo -e "${RED}❌ Repository name is required${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Configuration Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo "AWS Account: $AWS_ACCOUNT_ID"
echo "Region: $AWS_REGION"
echo "Environment: $ENVIRONMENT"
echo "Repository: $REPO_NAME"
echo ""

read -p "Continue with deployment? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo -e "${RED}Deployment cancelled${NC}"
    exit 0
fi

# Step 1: Create directory structure
echo ""
echo -e "${GREEN}Step 1: Creating directory structure...${NC}"
mkdir -p .github/workflows
mkdir -p terraform

# Step 2: Copy configuration files
echo -e "${GREEN}Step 2: Copying configuration files...${NC}"

# Create terraform configuration
cat > terraform/basic-deployment.tf <<'EOF'
# Copy the terraform configuration from terraform/basic-deployment.tf
# This is a placeholder - copy the actual content
EOF

# Create GitHub Actions workflows
cat > .github/workflows/deploy-backend.yml <<'EOF'
# Copy the backend workflow from .github/workflows/deploy-backend.yml
# This is a placeholder - copy the actual content
EOF

cat > .github/workflows/deploy-frontend.yml <<'EOF'
# Copy the frontend workflow from .github/workflows/deploy-frontend.yml
# This is a placeholder - copy the actual content
EOF

# Step 3: Create ECR repositories
echo ""
echo -e "${GREEN}Step 3: Creating ECR repositories...${NC}"
for repo in backend frontend; do
    aws ecr describe-repositories --repository-names $REPO_NAME/$repo --region $AWS_REGION 2>/dev/null || \
    aws ecr create-repository --repository-name $REPO_NAME/$repo --region $AWS_REGION
    echo -e "${GREEN}✓ Created $REPO_NAME/$repo${NC}"
done

# Step 4: Deploy infrastructure
echo ""
echo -e "${GREEN}Step 4: Deploying infrastructure with Terraform...${NC}"
cd terraform

terraform init

cat > terraform.tfvars <<EOF
aws_region = "$AWS_REGION"
environment = "$ENVIRONMENT"
db_password = "$DB_PASSWORD"
EOF

terraform plan -var-file=terraform.tfvars -out=tfplan

read -p "Review the plan above. Continue? (yes/no): " TERRAFORM_CONFIRM
if [ "$TERRAFORM_CONFIRM" != "yes" ]; then
    echo -e "${RED}Deployment cancelled${NC}"
    exit 0
fi

terraform apply tfplan

# Save outputs
terraform output > ../terraform-outputs.txt

cd ..

# Step 5: Get infrastructure details
echo ""
echo -e "${GREEN}Step 5: Retrieving infrastructure details...${NC}"

ALB_DNS=$(cd terraform && terraform output -raw alb_dns_name)
RDS_ENDPOINT=$(cd terraform && terraform output -raw rds_endpoint)
REDIS_ENDPOINT=$(cd terraform && terraform output -raw redis_endpoint)
EFS_ID=$(cd terraform && terraform output -raw efs_id)

echo -e "${GREEN}✓ ALB DNS: $ALB_DNS${NC}"
echo -e "${GREEN}✓ RDS Endpoint: $RDS_ENDPOINT${NC}"
echo -e "${GREEN}✓ Redis Endpoint: $REDIS_ENDPOINT${NC}"
echo -e "${GREEN}✓ EFS ID: $EFS_ID${NC}"

# Step 6: Build and push Docker images
echo ""
echo -e "${GREEN}Step 6: Building and pushing Docker images...${NC}"

# Login to ECR
aws ecr get-login-password --region $AWS_REGION | \
    docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Build and push backend
if [ -d "backend" ]; then
    echo -e "${YELLOW}Building backend...${NC}"
    cd backend
    docker build -t $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$REPO_NAME/backend:latest .
    docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$REPO_NAME/backend:latest
    cd ..
    echo -e "${GREEN}✓ Backend image pushed${NC}"
fi

# Build and push frontend
if [ -d "frontend" ]; then
    echo -e "${YELLOW}Building frontend...${NC}"
    cd frontend
    docker build -f Dockerfile.simple -t $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$REPO_NAME/frontend:latest .
    docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$REPO_NAME/frontend:latest
    cd ..
    echo -e "${GREEN}✓ Frontend image pushed${NC}"
fi

# Step 7: Create task definitions
echo ""
echo -e "${GREEN}Step 7: Creating ECS task definitions...${NC}"

# Create backend task definition
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
      "portMappings": [
        {
          "containerPort": 8000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "DATABASE_URL",
          "value": "postgresql://apranova_admin:$DB_PASSWORD@$RDS_ENDPOINT/apranova_db"
        },
        {
          "name": "REDIS_URL",
          "value": "redis://$REDIS_ENDPOINT:6379/0"
        },
        {
          "name": "DEBUG",
          "value": "False"
        },
        {
          "name": "ALLOWED_HOSTS",
          "value": "$ALB_DNS,localhost,*"
        }
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

# Create frontend task definition
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
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NEXT_PUBLIC_API_URL",
          "value": "http://$ALB_DNS"
        },
        {
          "name": "BACKEND_URL",
          "value": "http://$ALB_DNS"
        },
        {
          "name": "NODE_ENV",
          "value": "production"
        }
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

# Step 8: Summary
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Deployment Complete!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${GREEN}Infrastructure deployed successfully!${NC}"
echo ""
echo "Next steps:"
echo "1. Create ECS services (see REPLICATION_PACKAGE.md Step 7)"
echo "2. Run database migrations"
echo "3. Test your application at: http://$ALB_DNS"
echo ""
echo "Configuration saved to:"
echo "  - terraform-outputs.txt"
echo "  - backend-task-def.json"
echo "  - frontend-task-def.json"
echo ""
echo "GitHub Actions:"
echo "  - Configure secrets: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY"
echo "  - Update workflows with your account ID and region"
echo ""
echo -e "${YELLOW}Estimated monthly cost: ~$130${NC}"
echo ""

