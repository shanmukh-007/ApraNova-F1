# ⚡ Quick Replication Guide

**Copy this architecture to your new repository in 30 minutes!**

---

## 📦 What You're Getting

- Complete AWS infrastructure (VPC, ECS, RDS, Redis, ALB, EFS)
- CI/CD pipelines with GitHub Actions
- Production-ready configuration
- Cost: ~$130/month (optimizable to ~$75/month)

---

## 🚀 Quick Start (3 Steps)

### Step 1: Copy Files (2 minutes)

Copy these files to your new repository:

```bash
# Required files
.github/workflows/deploy-backend.yml
.github/workflows/deploy-frontend.yml
terraform/basic-deployment.tf
backend-task-def.json
frontend-task-def.json
deploy-basic-aws.sh
replicate-architecture.sh

# Documentation (optional)
REPLICATION_PACKAGE.md
ARCHITECTURE_EXPORT.md
AWS_ARCHITECTURE_DIAGRAM.md
```

### Step 2: Configure AWS (5 minutes)

```bash
# Install AWS CLI (if needed)
brew install awscli  # macOS
# or: apt install awscli  # Linux
# or: Download from aws.amazon.com/cli  # Windows

# Configure credentials
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Enter region: us-east-1
# Enter output format: json

# Verify
aws sts get-caller-identity
```

### Step 3: Deploy (20 minutes)

```bash
# Option A: Automated Script
chmod +x replicate-architecture.sh
./replicate-architecture.sh

# Option B: Manual Steps
cd terraform
terraform init
terraform apply
# Then follow REPLICATION_PACKAGE.md steps 5-9
```

---

## 📝 Configuration Checklist

### GitHub Secrets (Required)
Go to: Repository → Settings → Secrets → Actions

Add these secrets:
- `AWS_ACCESS_KEY_ID`: Your AWS access key
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret key

### Environment Variables (Update in task definitions)

**Backend:**
```bash
DATABASE_URL=postgresql://user:pass@your-rds-endpoint:5432/db
REDIS_URL=redis://your-redis-endpoint:6379/0
ALLOWED_HOSTS=your-alb-dns
DJANGO_SECRET_KEY=your-secret-key
```

**Frontend:**
```bash
NEXT_PUBLIC_API_URL=http://your-alb-dns
BACKEND_URL=http://your-alb-dns
```

---

## 🎯 What Gets Created

### AWS Resources (31 total)

**Networking (8)**
- 1 VPC
- 4 Subnets (2 public, 2 private)
- 1 Internet Gateway
- 1 NAT Gateway
- 2 Route Tables

**Compute (4)**
- 1 ECS Cluster
- 2 ECS Services (backend, frontend)
- 2 Task Definitions

**Database (2)**
- 1 RDS PostgreSQL instance
- 1 ElastiCache Redis cluster

**Storage (2)**
- 1 EFS File System
- 2 ECR Repositories

**Load Balancing (5)**
- 1 Application Load Balancer
- 2 Target Groups
- 1 Listener
- 1 Listener Rule

**Security (4)**
- 4 Security Groups (ALB, ECS, RDS, Redis)

**Monitoring (6)**
- 2 CloudWatch Log Groups
- CloudWatch Metrics
- CloudWatch Alarms (optional)

---

## 💰 Cost Breakdown

```
Monthly Costs:
├─ ECS Fargate:        $27  (2 tasks)
├─ RDS PostgreSQL:     $15  (db.t3.micro)
├─ ElastiCache Redis:  $12  (cache.t3.micro)
├─ NAT Gateway:        $33  (1 gateway)
├─ Load Balancer:      $22  (1 ALB)
├─ EFS:                $3   (10 GB)
├─ ECR:                $1   (1 GB)
├─ CloudWatch:         $3   (logs + metrics)
├─ Data Transfer:      $5   (outbound)
└─ Other:              $9   (misc)
────────────────────────────
TOTAL:                 $130/month

Cost Optimization:
- Remove NAT Gateway:  -$33  (use VPC endpoints)
- Use Fargate Spot:    -$8   (70% discount)
- Reduce task count:   -$14  (1 backend task)
────────────────────────────
Optimized:             $75/month
```

---

## 🔧 Common Customizations

### Change Region
```hcl
# In terraform/basic-deployment.tf
variable "aws_region" {
  default = "us-west-2"  # Change this
}
```

### Increase Resources
```hcl
# In terraform/basic-deployment.tf
resource "aws_db_instance" "main" {
  instance_class = "db.t3.small"  # Upgrade from micro
}
```

### Add HTTPS
```hcl
# In terraform/basic-deployment.tf
resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.main.arn
  port              = "443"
  protocol          = "HTTPS"
  certificate_arn   = "arn:aws:acm:..."
}
```

### Enable Auto-Scaling
```hcl
resource "aws_appautoscaling_target" "backend" {
  max_capacity       = 10
  min_capacity       = 2
  resource_id        = "service/production-cluster/backend"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}
```

---

## 🐛 Troubleshooting

### Issue: Terraform fails with "already exists"
**Solution**: Resource already created. Import it:
```bash
terraform import aws_vpc.main vpc-xxxxx
```

### Issue: ECS tasks not starting
**Solution**: Check CloudWatch logs:
```bash
aws logs tail /ecs/backend --follow
```

### Issue: Can't connect to database
**Solution**: Verify security group:
```bash
aws ec2 describe-security-groups --group-ids sg-xxxxx
```

### Issue: 502 Bad Gateway
**Solution**: Check target health:
```bash
aws elbv2 describe-target-health --target-group-arn arn:aws:...
```

### Issue: High costs
**Solution**: Check Cost Explorer:
```bash
aws ce get-cost-and-usage --time-period Start=2024-11-01,End=2024-11-30 --granularity MONTHLY --metrics BlendedCost
```

---

## 📊 Verification Steps

After deployment, verify everything works:

```bash
# 1. Get ALB DNS
ALB_DNS=$(cd terraform && terraform output -raw alb_dns_name)

# 2. Test backend health
curl http://$ALB_DNS/api/health
# Expected: {"status":"healthy"}

# 3. Test frontend
curl -I http://$ALB_DNS/
# Expected: HTTP/1.1 200 OK

# 4. Check ECS tasks
aws ecs list-tasks --cluster production-cluster
# Expected: 2 tasks running

# 5. Check database
aws rds describe-db-instances --db-instance-identifier production-apranova-db
# Expected: Status "available"

# 6. Check logs
aws logs tail /ecs/backend --since 5m
# Expected: No errors
```

---

## 🎓 Learning Resources

### Beginner
- [AWS Free Tier](https://aws.amazon.com/free/)
- [ECS Tutorial](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/getting-started.html)
- [Terraform Getting Started](https://learn.hashicorp.com/terraform)

### Intermediate
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [ECS Best Practices](https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/)
- [Terraform AWS Examples](https://github.com/terraform-aws-modules)

### Advanced
- [AWS Solutions Library](https://aws.amazon.com/solutions/)
- [ECS Reference Architecture](https://github.com/aws-samples/ecs-refarch-cloudformation)
- [Production-Ready Terraform](https://www.terraform.io/docs/cloud/guides/recommended-practices/index.html)

---

## 📞 Support

### Documentation
- Full guide: `REPLICATION_PACKAGE.md`
- Architecture details: `ARCHITECTURE_EXPORT.md`
- Visual diagrams: `AWS_ARCHITECTURE_DIAGRAM.md`

### AWS Support
- [AWS Support Center](https://console.aws.amazon.com/support/)
- [AWS Forums](https://forums.aws.amazon.com/)
- [AWS re:Post](https://repost.aws/)

### Community
- [Terraform Community](https://discuss.hashicorp.com/c/terraform-core/)
- [GitHub Discussions](https://github.com/aws/aws-cli/discussions)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/amazon-web-services)

---

## ✅ Success Criteria

You've successfully replicated the architecture when:

- [ ] All Terraform resources created without errors
- [ ] ECS tasks running and healthy
- [ ] Backend API responding at `/api/health`
- [ ] Frontend loading at `/`
- [ ] Database accessible from backend
- [ ] Redis accessible from backend
- [ ] GitHub Actions workflows configured
- [ ] Manual deployment works
- [ ] Costs within expected range (~$130/month)

---

## 🎉 Next Steps

After successful deployment:

1. **Secure your application**
   - Add SSL certificate
   - Enable AWS WAF
   - Configure CloudTrail

2. **Optimize costs**
   - Remove NAT Gateway if possible
   - Use Fargate Spot
   - Set up auto-scaling

3. **Improve monitoring**
   - Create CloudWatch dashboard
   - Set up alarms
   - Enable X-Ray tracing

4. **Scale for production**
   - Increase task counts
   - Enable Multi-AZ for RDS
   - Add read replicas

5. **Automate operations**
   - Set up automated backups
   - Configure auto-scaling policies
   - Implement blue-green deployments

---

**Time to Deploy**: 30 minutes  
**Difficulty**: Intermediate  
**Cost**: ~$130/month  
**Maintenance**: Low

**Good luck with your deployment! 🚀**
