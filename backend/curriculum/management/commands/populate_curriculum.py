from django.core.management.base import BaseCommand
from curriculum.models import Track, Project, ProjectStep, Deliverable


class Command(BaseCommand):
    help = 'Populate curriculum with tracks, projects, steps, and deliverables'

    def handle(self, *args, **kwargs):
        self.stdout.write('Populating curriculum...')
        
        # Clear existing data
        Track.objects.all().delete()
        
        # Create Data Professional Track
        dp_track = Track.objects.create(
            code='DP',
            name='Data Professional',
            description='Master data analytics, SQL, ETL pipelines, and cloud data warehousing',
            icon='database',
            duration_weeks=12
        )
        
        # DP Project 1: Business Analytics Dashboard
        dp_project1 = Project.objects.create(
            track=dp_track,
            number=1,
            title='Business Analytics Dashboard',
            subtitle='Internal',
            description='Build an interactive dashboard using Python, PostgreSQL, and Apache Superset',
            project_type='INTERNAL',
            tech_stack=['Python', 'Pandas', 'PostgreSQL', 'SQL', 'Apache Superset', 'Jupyter Lab'],
            estimated_hours=40,
            order=1
        )
        
        # DP Project 1 Steps
        ProjectStep.objects.bulk_create([
            ProjectStep(project=dp_project1, step_number=1, title='Clean raw CSV dataset in Python/Pandas', 
                       description='Load and clean raw data using Pandas', estimated_minutes=180, order=1),
            ProjectStep(project=dp_project1, step_number=2, title='Load transformed data into PostgreSQL', 
                       description='Create student schema and load cleaned data', estimated_minutes=120, order=2),
            ProjectStep(project=dp_project1, step_number=3, title='Write complex SQL queries for KPIs & insights', 
                       description='Use joins, aggregations, and window functions', estimated_minutes=240, order=3),
            ProjectStep(project=dp_project1, step_number=4, title='Connect Superset to PostgreSQL schema', 
                       description='Set up Superset connection to your database', estimated_minutes=90, order=4),
            ProjectStep(project=dp_project1, step_number=5, title='Build interactive dashboard with filters/charts', 
                       description='Create visualizations and add interactivity', estimated_minutes=300, order=5),
            ProjectStep(project=dp_project1, step_number=6, title='Summarize findings in a 1-page insights report', 
                       description='Write executive-style PDF report', estimated_minutes=120, order=6),
        ])
        
        # DP Project 1 Deliverables
        Deliverable.objects.bulk_create([
            Deliverable(project=dp_project1, title='Superset Dashboard URL (live link)', 
                       deliverable_type='LINK', is_required=True, order=1),
            Deliverable(project=dp_project1, title='SQL queries (GitHub repo / script file)', 
                       deliverable_type='GITHUB', is_required=True, order=2),
            Deliverable(project=dp_project1, title='PDF Insights Report (executive-style)', 
                       deliverable_type='FILE', is_required=True, order=3),
        ])
        
        # DP Project 2: Automated ETL Pipeline
        dp_project2 = Project.objects.create(
            track=dp_track,
            number=2,
            title='Automated ETL Pipeline',
            subtitle='Internal',
            description='Build an automated data pipeline with API extraction, transformation, and scheduling',
            project_type='INTERNAL',
            tech_stack=['Python', 'Pandas', 'Requests', 'PostgreSQL', 'Prefect', 'SMTP/Email API'],
            estimated_hours=45,
            order=2
        )
        
        # DP Project 2 Steps
        ProjectStep.objects.bulk_create([
            ProjectStep(project=dp_project2, step_number=1, title='Pick a public API (weather, COVID, finance)', 
                       description='Select and explore API documentation', estimated_minutes=60, order=1),
            ProjectStep(project=dp_project2, step_number=2, title='Use Requests to pull daily API data', 
                       description='Write Python script to fetch data from API', estimated_minutes=180, order=2),
            ProjectStep(project=dp_project2, step_number=3, title='Transform data with Pandas', 
                       description='Clean and transform API data', estimated_minutes=150, order=3),
            ProjectStep(project=dp_project2, step_number=4, title='Load into PostgreSQL schema (new table)', 
                       description='Create table and insert transformed data', estimated_minutes=120, order=4),
            ProjectStep(project=dp_project2, step_number=5, title='Orchestrate using Prefect (scheduling + monitoring)', 
                       description='Set up Prefect workflow with scheduling', estimated_minutes=240, order=5),
            ProjectStep(project=dp_project2, step_number=6, title='Add daily email report summarizing KPIs', 
                       description='Configure email notifications with summary', estimated_minutes=150, order=6),
        ])
        
        # DP Project 2 Deliverables
        Deliverable.objects.bulk_create([
            Deliverable(project=dp_project2, title='Python ETL script (GitHub repo)', 
                       deliverable_type='GITHUB', is_required=True, order=1),
            Deliverable(project=dp_project2, title='Prefect workflow DAG (export/visualization)', 
                       deliverable_type='FILE', is_required=True, order=2),
            Deliverable(project=dp_project2, title='PostgreSQL table with daily updated data', 
                       deliverable_type='TEXT', is_required=True, order=3),
            Deliverable(project=dp_project2, title='Example email report screenshot', 
                       deliverable_type='FILE', is_required=True, order=4),
        ])
        
        # DP Project 3: End-to-End Analytics Solution (Capstone)
        dp_project3 = Project.objects.create(
            track=dp_track,
            number=3,
            title='End-to-End Analytics Solution',
            subtitle='Capstone – External Cloud',
            description='Deploy a complete analytics solution on cloud infrastructure with BigQuery/Redshift',
            project_type='CAPSTONE',
            tech_stack=['Google BigQuery/Redshift', 'PostgreSQL', 'Python', 'Advanced SQL', 'Apache Superset', 'Cloud SDK'],
            estimated_hours=60,
            order=3
        )
        
        # DP Project 3 Steps
        ProjectStep.objects.bulk_create([
            ProjectStep(project=dp_project3, step_number=1, title='Connect to multiple sources (API + PostgreSQL)', 
                       description='Set up connections to API and existing PostgreSQL data', estimated_minutes=120, order=1),
            ProjectStep(project=dp_project3, step_number=2, title='Load combined dataset into BigQuery/Redshift', 
                       description='Use Cloud SDK to load data into cloud warehouse', estimated_minutes=180, order=2),
            ProjectStep(project=dp_project3, step_number=3, title='Write optimized SQL queries (window functions, partitioning)', 
                       description='Create advanced SQL queries for analysis', estimated_minutes=240, order=3),
            ProjectStep(project=dp_project3, step_number=4, title='Build executive-level Superset dashboard on cloud DB', 
                       description='Connect Superset to BigQuery/Redshift and build dashboard', estimated_minutes=300, order=4),
            ProjectStep(project=dp_project3, step_number=5, title='Write case study report with business recommendations', 
                       description='Create comprehensive case study document', estimated_minutes=180, order=5),
            ProjectStep(project=dp_project3, step_number=6, title='Deploy live dashboard on cloud infrastructure', 
                       description='Finalize deployment and test public access', estimated_minutes=120, order=6),
        ])
        
        # DP Project 3 Deliverables
        Deliverable.objects.bulk_create([
            Deliverable(project=dp_project3, title='Cloud-hosted dashboard (Superset → BigQuery/Redshift)', 
                       deliverable_type='LINK', is_required=True, order=1),
            Deliverable(project=dp_project3, title='SQL query scripts (GitHub repo)', 
                       deliverable_type='GITHUB', is_required=True, order=2),
            Deliverable(project=dp_project3, title='Final PDF Case Study Report (executive style, portfolio-ready)', 
                       deliverable_type='FILE', is_required=True, order=3),
        ])
        
        self.stdout.write(self.style.SUCCESS('✓ Data Professional track created'))
        
        # Create Full-Stack Developer Track
        fsd_track = Track.objects.create(
            code='FSD',
            name='Full-Stack Developer',
            description='Build modern web applications with React, backend frameworks, and DevOps',
            icon='code',
            duration_weeks=12
        )
        
        # FSD Project 1: Responsive Portfolio Website
        fsd_project1 = Project.objects.create(
            track=fsd_track,
            number=1,
            title='Responsive Portfolio Website',
            subtitle='Internal',
            description='Create a modern, responsive portfolio website with React and Tailwind CSS',
            project_type='INTERNAL',
            tech_stack=['HTML5', 'CSS3', 'Tailwind CSS', 'React', 'Netlify CLI'],
            estimated_hours=30,
            order=1
        )
        
        # FSD Project 1 Steps
        ProjectStep.objects.bulk_create([
            ProjectStep(project=fsd_project1, step_number=1, title='Build portfolio structure (Hero, About, Projects, Contact)', 
                       description='Create React components for each section', estimated_minutes=240, order=1),
            ProjectStep(project=fsd_project1, step_number=2, title='Style using Tailwind CSS for modern responsiveness', 
                       description='Apply Tailwind classes and create responsive design', estimated_minutes=180, order=2),
            ProjectStep(project=fsd_project1, step_number=3, title='Deploy via Netlify CLI (free tier)', 
                       description='Set up Netlify deployment and configure build', estimated_minutes=90, order=3),
            ProjectStep(project=fsd_project1, step_number=4, title='Add custom domain + form handling (optional)', 
                       description='Configure custom domain and contact form', estimated_minutes=60, order=4),
        ])
        
        # FSD Project 1 Deliverables
        Deliverable.objects.bulk_create([
            Deliverable(project=fsd_project1, title='Live Netlify link (personal portfolio)', 
                       deliverable_type='LINK', is_required=True, order=1),
            Deliverable(project=fsd_project1, title='GitHub repo with React + Tailwind code', 
                       deliverable_type='GITHUB', is_required=True, order=2),
        ])
        
        # FSD Project 2: E-Commerce Platform (Django Track)
        fsd_project2_django = Project.objects.create(
            track=fsd_track,
            number=2,
            title='E-Commerce Platform (Django)',
            subtitle='Internal - Python Track',
            description='Build a full-stack e-commerce application with React frontend and Django REST backend',
            project_type='INTERNAL',
            tech_stack=['React', 'Django REST Framework', 'PostgreSQL', 'Stripe (sandbox)', 'Pytest'],
            estimated_hours=50,
            order=2
        )
        
        # FSD Project 2 Django Steps
        ProjectStep.objects.bulk_create([
            ProjectStep(project=fsd_project2_django, step_number=1, title='Build frontend product catalog + shopping cart in React', 
                       description='Create product listing and cart functionality', estimated_minutes=300, order=1),
            ProjectStep(project=fsd_project2_django, step_number=2, title='Backend → Django REST API for products, users, orders', 
                       description='Build REST API endpoints with Django', estimated_minutes=360, order=2),
            ProjectStep(project=fsd_project2_django, step_number=3, title='Integrate PostgreSQL for persistence', 
                       description='Set up database models and migrations', estimated_minutes=120, order=3),
            ProjectStep(project=fsd_project2_django, step_number=4, title='Implement Stripe (sandbox) checkout', 
                       description='Integrate Stripe payment gateway', estimated_minutes=240, order=4),
            ProjectStep(project=fsd_project2_django, step_number=5, title='Add auth + order history', 
                       description='Implement user authentication and order tracking', estimated_minutes=180, order=5),
            ProjectStep(project=fsd_project2_django, step_number=6, title='Write backend unit tests in Pytest', 
                       description='Create comprehensive test suite', estimated_minutes=180, order=6),
        ])
        
        # FSD Project 2 Django Deliverables
        Deliverable.objects.bulk_create([
            Deliverable(project=fsd_project2_django, title='Live running e-commerce site (demo environment)', 
                       deliverable_type='LINK', is_required=True, order=1),
            Deliverable(project=fsd_project2_django, title='GitHub repo with frontend + backend', 
                       deliverable_type='GITHUB', is_required=True, order=2),
            Deliverable(project=fsd_project2_django, title='Stripe sandbox integration proof (test payments)', 
                       deliverable_type='FILE', is_required=True, order=3),
        ])
        
        # FSD Project 3: Social Dashboard + DevOps (Django Track)
        fsd_project3_django = Project.objects.create(
            track=fsd_track,
            number=3,
            title='Social Dashboard + DevOps (Django)',
            subtitle='Capstone – External Cloud - Python Track',
            description='Build and deploy a real-time social platform with CI/CD on cloud infrastructure',
            project_type='CAPSTONE',
            tech_stack=['React', 'Django Channels', 'PostgreSQL', 'Redis', 'Docker', 'Terraform', 'GitHub Actions', 'Cloud VPS/DB'],
            estimated_hours=70,
            order=3
        )
        
        # FSD Project 3 Django Steps
        ProjectStep.objects.bulk_create([
            ProjectStep(project=fsd_project3_django, step_number=1, title='Build social app frontend (posts, comments, likes) in React', 
                       description='Create interactive social media UI', estimated_minutes=360, order=1),
            ProjectStep(project=fsd_project3_django, step_number=2, title='Backend → Django Channels with Redis for real-time notifications', 
                       description='Implement WebSocket connections for real-time features', estimated_minutes=420, order=2),
            ProjectStep(project=fsd_project3_django, step_number=3, title='Containerize app with Docker', 
                       description='Create Dockerfiles and docker-compose setup', estimated_minutes=180, order=3),
            ProjectStep(project=fsd_project3_django, step_number=4, title='Write Terraform scripts → provision cloud infrastructure', 
                       description='Create infrastructure as code', estimated_minutes=240, order=4),
            ProjectStep(project=fsd_project3_django, step_number=5, title='Build CI/CD pipeline with GitHub Actions', 
                       description='Set up automated testing and deployment', estimated_minutes=240, order=5),
            ProjectStep(project=fsd_project3_django, step_number=6, title='Deploy live to cloud (public URL)', 
                       description='Complete deployment and configure DNS', estimated_minutes=180, order=6),
        ])
        
        # FSD Project 3 Django Deliverables
        Deliverable.objects.bulk_create([
            Deliverable(project=fsd_project3_django, title='Cloud-deployed app URL', 
                       deliverable_type='LINK', is_required=True, order=1),
            Deliverable(project=fsd_project3_django, title='GitHub repo with Docker + Terraform + CI/CD config', 
                       deliverable_type='GITHUB', is_required=True, order=2),
            Deliverable(project=fsd_project3_django, title='Demo video of real-time notifications', 
                       deliverable_type='FILE', is_required=True, order=3),
        ])
        
        self.stdout.write(self.style.SUCCESS('✓ Full-Stack Developer track created'))
        self.stdout.write(self.style.SUCCESS(f'✓ Total: {Track.objects.count()} tracks, {Project.objects.count()} projects'))
        self.stdout.write(self.style.SUCCESS(f'✓ {ProjectStep.objects.count()} steps, {Deliverable.objects.count()} deliverables'))
