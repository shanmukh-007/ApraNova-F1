This file explains **what**, **why**, **where**, and gives the developer an actionable checklist of GDPR_IMPLEMENTATION.

---

# **GDPR_PHASE1_IMPLEMENTATION.md**

### **ApraNova – GDPR Phase-1 (Developer Implementation Guide)**

This document explains everything required to make ApraNova compliant with the **Phase-1 GDPR Baseline** before launch.
It includes: infra changes, backend/frontend updates, retention rules, secrets handling, and required documentation.

---

# **0. Folder Structure**

Create the following folder in repo root:

```
/investor-diligence/
    /GDPR/
        GDPR_PHASE1_IMPLEMENTATION.md   ← this file
        phase-1-baseline.md
        data-map.md
        subprocessors.md
        breach-response.md
```

This folder is required for investor due-diligence.

---

# **1. Encryption at Rest**

### **What to do**

* EFS must be created with `encrypted = true`.
* RDS/Aurora must have storage encryption enabled.
* Fargate ephemeral storage is encrypted by AWS by default.

### **Where**

Terraform module managing:

* EFS
* Aurora PostgreSQL

### **Why**

Prevents data exposure if snapshots or disks are leaked. Required under **GDPR Article 32 (Security of Processing)**.

### **Terraform snippet**

```hcl
resource "aws_efs_file_system" "apranova" {
  encrypted = true
}
```

If EFS is already created without encryption → recreate it.

---

# **2. Encryption in Transit (HTTPS + EFS TLS)**

### **What to do**

1. ALB must serve only **HTTPS** traffic.
2. ECS → EFS mount must use **TLS** (`transit_encryption = "ENABLED"`).

### **Where**

Terraform – ALB listener, ECS task definition, EFS volume configuration.

### **Why**

Prevents MITM attacks and fulfills **GDPR Article 32** for data-in-transit protection.

### **ALB (Terraform)**

```hcl
resource "aws_lb_listener" "https" {
  port            = 443
  protocol        = "HTTPS"
  certificate_arn = aws_acm_certificate.apranova.arn
  ssl_policy      = "ELBSecurityPolicy-TLS-1-2-2017-01"
}
```

### **EFS TLS**

```hcl
efs_volume_configuration {
  file_system_id     = aws_efs_file_system.apranova.id
  transit_encryption = "ENABLED"
}
```

---

# **3. Least-Privilege IAM for ECS Task**

### **What to do**

Create an ECS task IAM role that can only:

* Read required SSM parameters (`/apra/*`)
* Access its own EFS Access Point only
* Perform minimal AWS actions — no `"*:*"` permissions

### **Where**

Terraform – IAM module for ECS task role.

### **Why**

Limits damage if the container is compromised.
Required under **GDPR Article 25 (Privacy by Design)**.

### **Example**

```hcl
statement {
  actions = ["ssm:GetParameter"]
  resources = ["arn:aws:ssm:us-east-1:<acc>:parameter/apra/*"]
}
```

---

# **4. Logging & Retention**

### **What to do**

* ECS log groups → 90-day retention
* VPC Flow Logs enabled
* S3 backup bucket → delete objects after 30 days

### **Where**

Terraform log groups, VPC module, S3 lifecycle.

### **Why**

GDPR forbids indefinite storage of personal logs.
Access logs also support accountability (Article 30).

### **CloudWatch retention**

```hcl
resource "aws_cloudwatch_log_group" "student_logs" {
  name              = "/ecs/student"
  retention_in_days = 90
}
```

---

# **5. Database Backup & Retention (Article 17)**

### **What to do**

Implement a backup routine:

1. Daily `pg_dump`
2. Upload dump file to encrypted S3 bucket
3. Delete local dump file after upload
4. S3 lifecycle:

   * IA tier (optional)
   * Delete after 30 days

### **Where**

* Backup script in repo
* ECS Scheduled Task or cron-style container
* Terraform for S3 lifecycle

### **Why**

Backups must exist but cannot store personal data indefinitely.

---

# **6. Data Minimisation (Container Hardening)**

### **What to do**

* Use multi-stage Docker build
* Final container must only include runtime deps
* Final image < 250 MB if possible
* No secrets in environment variables or Dockerfile
* No build tools in final layer

### **Where**

Backend Dockerfile.

### **Why**

Reduces attack surface and avoids accidental leakage of sensitive data.
Required under **GDPR Article 5(1)(c)**.

### **Example**

```dockerfile
FROM python:3.12 AS builder
...
FROM python:3.12-slim
...
```

---

# **7. Secrets Management via SSM**

### **What to do**

Move all secrets to SSM Parameter Store:

* DB password
* Stripe keys
* SMTP login
* Any API keys

Inject via ECS Task Definition:

```json
"secrets": [
  {
    "name": "PGPASSWORD",
    "valueFrom": "arn:aws:ssm:us-east-1:<acc>:parameter/apra/db-pass"
  }
]
```

### **Where**

Terraform for SSM parameters + ECS definitions.

### **Why**

Eliminates risk of committing secrets to Git, Docker, or env files.

---

# **8. Privacy Notice (Frontend + Backend)**

### **What to do**

Add this text to the first screen of onboarding:

> “We process your name, email, and IP to deliver the course, secure the platform, and issue certificates.
> Data is stored in encrypted AWS ECS containers in the US.
> You may request deletion (except payment records retained for 7 yrs).
> Contact: [privacy@apranova.com](mailto:privacy@apranova.com).”

Add:

* Checkbox: “I have read and understand this notice”
* Store in DB:

  * `privacy_accepted_at`
  * `privacy_version`

### **Where**

Frontend onboarding page + backend user model.

### **Why**

Required under **GDPR Article 13**.

---

# **9. Account Deletion / Anonymisation (Article 17)**

### **What to do**

Create backend endpoint that:

* Deletes or anonymises personal fields
* Removes access tokens
* Retains payment records (legal requirement), but detaches them from user

Frontend:

* Add “Delete My Account” button under user settings.

### **Where**

Backend API + frontend profile/settings page.

### **Why**

Users have the right to request erasure of their personal data.

---

# **10. Sub-Processor Documentation**

### **What to do**

Document all services that process personal data:

| Provider           | Purpose           |
| ------------------ | ----------------- |
| AWS                | Hosting, DB, logs |
| Stripe             | Payments          |
| SES / SMTP         | Email             |
| Any analytics tool | Optional          |

### **Where**

`/investor-diligence/GDPR/subprocessors.md`

### **Why**

GDPR Article 28 requires transparency of all third-party processors.

---

# **11. Breach Response Plan (Required)**

### **What to do**

Add a 1–2 page markdown file describing:

* How a suspected breach is identified
* Who investigates
* Lockdown steps
* 72-hour notification rule
* Evidence collection
* Communication

### **Where**

`/investor-diligence/GDPR/breach-response.md`

---

# **12. Final Developer Checklist**

### **Terraform**

* [ ] EFS encrypted
* [ ] RDS encrypted
* [ ] ALB HTTPS listener with ACM
* [ ] Transit encryption on EFS mount
* [ ] ECS Task Role → least privilege
* [ ] CloudWatch retention = 90 days
* [ ] VPC Flow Logs enabled
* [ ] S3 backup bucket lifecycle = 30 days
* [ ] SSM parameters for secrets

### **Docker**

* [ ] Multi-stage build
* [ ] Final image slim, <250MB
* [ ] No secrets in image/env

### **Backend**

* [ ] Account deletion/anonymisation endpoint
* [ ] Privacy acceptance fields stored
* [ ] SSM secrets used for DB/Stripe/SMTP

### **Frontend**

* [ ] Privacy notice + checkbox in onboarding
* [ ] Delete account UI

### **Documentation**

* [ ] phase-1-baseline.md
* [ ] data-map.md
* [ ] subprocessors.md
* [ ] breach-response.md

---

# **Completion Criteria**

You are Phase-1 compliant when:

* All items in checklist = Completed
* ApraNova is running HTTPS-only
* Secrets fully moved to SSM
* Logs + data retention enforced
* Onboarding privacy notice active
* Delete-account workflow active
* Docs folder committed

---

