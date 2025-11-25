#!/bin/bash
set -e

# Get infrastructure outputs
ALB_DNS="production-alb-27515905.us-east-1.elb.amazonaws.com"
RDS_ENDPOINT="production-apranova-db.cqzg84imcy8x.us-east-1.rds.amazonaws.com:5432"
REDIS_ENDPOINT="production-redis.ca9eju.0001.use1.cache.amazonaws.com"
ECS_CLUSTER="production-cluster"
ECS_SG="sg-07537daec64f6f5af"
PRIVATE_SUBNETS="subnet-073c9b86121fa63cb,subnet-0aefed551aea58825"

echo "Creating ECS Task Definitions..."

# Create IAM role if needed
aws iam get-role --role-name ecsTaskExecutionRole 2>/dev/null || {
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
}

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
        {"name": "DATABASE_URL", "value": "postgresql://apranova_admin:ApraNova2024Secure!@${RDS_ENDPOINT}/apranova_db"},
        {"name": "REDIS_URL", "value": "redis://${REDIS_ENDPOINT}:6379/0"},
        {"name": "DEBUG", "value": "False"},
        {"name": "ALLOWED_HOSTS", "value": "${ALB_DNS},localhost,*"}
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
        {"name": "NEXT_PUBLIC_API_URL", "value": "http://${ALB_DNS}"},
        {"name": "BACKEND_URL", "value": "http://${ALB_DNS}"},
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
echo "Registering task definitions..."
aws ecs register-task-definition --cli-input-json file://backend-task-def.json
aws ecs register-task-definition --cli-input-json file://frontend-task-def.json

# Get target group ARNs
BACKEND_TG_ARN=$(aws elbv2 describe-target-groups --names production-backend-tg --query 'TargetGroups[0].TargetGroupArn' --output text)
FRONTEND_TG_ARN=$(aws elbv2 describe-target-groups --names production-frontend-tg --query 'TargetGroups[0].TargetGroupArn' --output text)

echo "Creating ECS services..."

# Create backend service
aws ecs create-service \
  --cluster $ECS_CLUSTER \
  --service-name backend \
  --task-definition backend \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[$PRIVATE_SUBNETS],securityGroups=[$ECS_SG],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=$BACKEND_TG_ARN,containerName=backend,containerPort=8000" \
  || echo "Backend service may already exist"

# Create frontend service
aws ecs create-service \
  --cluster $ECS_CLUSTER \
  --service-name frontend \
  --task-definition frontend \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[$PRIVATE_SUBNETS],securityGroups=[$ECS_SG],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=$FRONTEND_TG_ARN,containerName=frontend,containerPort=3000" \
  || echo "Frontend service may already exist"

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Application URL: http://$ALB_DNS"
echo "Backend API: http://$ALB_DNS/api/"
echo "Admin: http://$ALB_DNS/admin/"
echo ""
echo "Services will take 2-3 minutes to become healthy."
echo ""
echo "Check status:"
echo "  aws ecs describe-services --cluster $ECS_CLUSTER --services backend frontend"
echo ""
echo "View logs:"
echo "  aws logs tail /ecs/backend --follow"
echo "  aws logs tail /ecs/frontend --follow"
