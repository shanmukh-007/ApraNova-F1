# Apra Nova - Complete Curriculum Specifications

## 🧑‍💻 Data Professional (DP) Track

### Project 1: Business Analytics Dashboard (Internal)

**Tech Stack:**
- Python, Pandas
- PostgreSQL (student schema per project)
- SQL (joins, aggregations, window functions)
- Apache Superset (dashboard)
- Jupyter Lab (analysis + reporting)

**Workflow:**
1. Clean raw CSV dataset in Python/Pandas
2. Load transformed data into PostgreSQL (student schema)
3. Write complex SQL queries for KPIs & insights
4. Connect Superset to PostgreSQL schema
5. Build interactive dashboard with filters/charts
6. Summarize findings in a 1-page insights report

**Deliverables:**
- Superset Dashboard URL (live link)
- SQL queries (GitHub repo / script file)
- PDF Insights Report (executive-style)

---

### Project 2: Automated ETL Pipeline (Internal)

**Tech Stack:**
- Python, Pandas
- Requests (API extraction)
- PostgreSQL (new schema)
- Prefect (workflow orchestration)
- SMTP/Email API (report delivery)

**Workflow:**
1. Pick a public API (weather, COVID, finance)
2. Use Requests to pull daily API data
3. Transform data with Pandas
4. Load into PostgreSQL schema (new table)
5. Orchestrate using Prefect (scheduling + monitoring)
6. Add daily email report summarizing KPIs

**Deliverables:**
- Python ETL script (GitHub repo)
- Prefect workflow DAG (export/visualization)
- PostgreSQL table with daily updated data
- Example email report screenshot

---

### Project 3: End-to-End Analytics Solution (Capstone – External Cloud)

**Tech Stack:**
- Google BigQuery (Free Tier) OR AWS Redshift (Free Tier)
- PostgreSQL (source DB)
- Python (for ingestion, optional)
- Advanced SQL (partitioning, windowing, optimization)
- Apache Superset (connected to BigQuery/Redshift)
- Google Cloud/AWS SDK (auth & data load)

**Workflow:**
1. Connect to multiple sources:
   - API (fresh data)
   - PostgreSQL schema (from prior project)
2. Load combined dataset into BigQuery/Redshift
3. Write optimized SQL queries (window functions, partitioning)
4. Build executive-level Superset dashboard directly on cloud DB
5. Write case study report with business recommendations
6. Deploy live dashboard on cloud infra (BigQuery/Redshift backend)

**Deliverables:**
- Cloud-hosted dashboard (Superset → BigQuery/Redshift)
- SQL query scripts (GitHub repo)
- Final PDF Case Study Report (executive style, portfolio-ready)

---

## 🎯 Summary of DP Track Outcomes

- **Project 1:** Dashboarding & SQL fundamentals
- **Project 2:** Automation & ETL pipeline orchestration
- **Project 3:** Cloud data warehouse deployment & business storytelling

**Students graduate with:**
- 3 live dashboards
- ETL pipeline portfolio piece
- Cloud-deployed analytics project (resume highlight)

---

## 👨‍💻 Full-Stack Developer (FSD) Track

### Project 1: Responsive Portfolio Website (Internal)

**Tech Stack:**
- HTML5, CSS3
- Tailwind CSS (modern styling framework)
- React (SPA components)
- Netlify CLI (deployment, free hosting)

**Workflow:**
1. Build portfolio structure → Hero, About Me, Projects, Contact Form
2. Style using Tailwind CSS for modern responsiveness
3. Deploy via Netlify CLI (free tier)
4. Add custom domain + form handling (optional)

**Deliverables:**
- Live Netlify link (personal portfolio)
- GitHub repo with React + Tailwind code

---

### Project 2: E-Commerce Platform (Internal)

#### Track A – Python (Django)

**Tech Stack:**
- React
- Django REST Framework
- PostgreSQL
- Stripe (sandbox)
- Pytest

**Workflow:**
1. Build frontend product catalog + shopping cart in React
2. Backend → Django REST API for products, users, orders
3. Integrate PostgreSQL for persistence
4. Implement Stripe (sandbox) checkout
5. Add auth + order history
6. Write backend unit tests in Pytest

**Deliverables:**
- Live running e-commerce site (demo environment)
- GitHub repo with frontend + backend
- Stripe sandbox integration proof (test payments)

#### Track B – Java (Spring Boot)

**Tech Stack:**
- React
- Spring Boot (REST API)
- PostgreSQL
- Stripe (sandbox)
- JUnit

**Workflow:**
1. Build frontend product catalog + shopping cart in React
2. Backend → Spring Boot REST API for products, users, orders
3. Integrate PostgreSQL for persistence
4. Implement Stripe (sandbox) checkout
5. Add auth + order history
6. Write backend unit tests in JUnit

**Deliverables:**
- Same as Django track: live e-commerce site, GitHub repo, Stripe sandbox test flow

---

### Project 3: Social Dashboard + DevOps (Capstone – External Cloud)

#### Track A – Python (Django)

**Tech Stack:**
- React
- Django Channels
- PostgreSQL
- Redis (cache/sessions)
- Docker
- Terraform
- GitHub Actions
- AWS EC2/RDS (free tier)

**Workflow:**
1. Build social app frontend → posts, comments, likes in React
2. Backend → Django Channels with Redis for real-time notifications
3. Containerize app with Docker
4. Write Terraform scripts → provision AWS EC2 + RDS
5. Build CI/CD pipeline with GitHub Actions → auto-test + deploy
6. Deploy live to AWS free tier (public URL)

**Deliverables:**
- Cloud-deployed app URL (AWS/GCP)
- GitHub repo with Docker + Terraform + CI/CD config
- Demo video of real-time notifications

#### Track B – Java (Spring Boot)

**Tech Stack:**
- React
- Spring Boot + Spring WebSockets
- PostgreSQL
- Redis
- Docker
- Terraform
- GitHub Actions
- AWS/GCP free tier

**Workflow:**
1. Frontend in React → posts, comments, likes
2. Backend → Spring Boot + WebSockets for real-time events
3. Add Redis for caching/session handling
4. Dockerize app
5. Write Terraform scripts → AWS/GCP deployment
6. Build CI/CD with GitHub Actions
7. Deploy live to AWS/GCP free tier

**Deliverables:**
- Same as Django track: cloud-deployed URL, GitHub repo with DevOps configs, demo video

---

## 🎯 Student Outcomes (FSD Track)

- **Project 1:** Frontend + deployment fundamentals
- **Project 2:** Full-stack transactions, auth, and payments
- **Project 3:** Real-time app + DevOps + cloud deployment

**Students graduate with:**
- Portfolio website (live)
- E-commerce app (transaction-ready)
- Cloud-deployed social platform with CI/CD

---

## 📊 Tool Provisioning Strategy

### DP Track Tools by Project

**Project 1:**
- Jupyter Lab (data cleaning)
- PostgreSQL (student schema)
- Apache Superset (dashboards)

**Project 2:**
- Jupyter Lab (API extraction)
- PostgreSQL (new schema)
- Prefect (orchestration)
- Apache Superset (monitoring)

**Project 3:**
- Jupyter Lab (data combination)
- PostgreSQL (source DB)
- Google BigQuery / AWS Redshift (cloud warehouse)
- Apache Superset (cloud dashboards)

### FSD Track Tools by Project

**Project 1:**
- VS Code Server (development)
- Netlify CLI (deployment)

**Project 2:**
- VS Code Server (development)
- PostgreSQL (database)
- Stripe Sandbox (payments)

**Project 3:**
- VS Code Server (development)
- PostgreSQL (database)
- Redis (caching/real-time)
- Docker (containerization)
- AWS Console (cloud deployment)
- GitHub Actions (CI/CD)

---

## 🚀 Implementation Notes

1. **Progressive Tool Unlocking:** Tools are unlocked per project, not all at once
2. **Project-Based Learning:** Each project builds on previous skills
3. **Cloud Integration:** Final projects use external cloud services (free tiers)
4. **Portfolio Ready:** All projects are designed to be resume/portfolio highlights
5. **Real-World Tech Stack:** Uses industry-standard tools and frameworks
