#!/bin/bash

echo "🧪 Manual Webhook Test - Simulating GitHub PR Event"
echo ""

# Get the PR URL from user
PR_URL="https://github.com/ApraNova-bootcamp/2025-dp-rootuserall-automated-etl-pipeline/pull/1"

echo "Testing with PR: $PR_URL"
echo ""

# Simulate webhook payload
sudo docker exec apranova_backend python manage.py shell -c "
import json
from django.test import RequestFactory
from curriculum.webhook_views import github_webhook
from accounts.models import CustomUser
from curriculum.models import Project, StudentProgress

# Get student
student = CustomUser.objects.filter(email='student10@gmail.com').first()
if not student:
    print('❌ Student not found')
    exit()

print(f'Student: {student.email}')
print(f'GitHub: {student.github_username}')

# Get project
progress = StudentProgress.objects.filter(
    student=student,
    github_repo_name='2025-dp-rootuserall-automated-etl-pipeline'
).first()

if not progress:
    print('❌ Project progress not found')
    exit()

project = progress.project
print(f'Project: {project.title}')
print(f'Repo: {progress.github_repo_url}')
print()

# Simulate PR opened event
print('🔄 Simulating PR opened event...')

from utils.slack import notify_pr_created, notify_new_submission
from curriculum.models import Submission, Deliverable

# Send PR notification
pr_url = '$PR_URL'
notify_pr_created(student, project, pr_url)
print('✅ Slack: PR created notification sent')

# Create submission automatically
deliverable = Deliverable.objects.filter(project=project).first()
if deliverable:
    submission, created = Submission.objects.get_or_create(
        student=student,
        deliverable=deliverable,
        github_pr_url=pr_url,
        defaults={
            'github_pr_number': 1,
            'auto_created': True,
            'status': 'PENDING',
            'submission_text': f'Auto-submitted from PR #1'
        }
    )
    
    if created:
        print('✅ Submission created automatically')
        notify_new_submission(submission)
        print('✅ Slack: New submission notification sent')
    else:
        print('⚠️  Submission already exists')
else:
    print('⚠️  No deliverable found for this project')

print()
print('=' * 60)
print('✅ Manual webhook simulation complete!')
print('📱 Check your Slack channel for notifications')
print('📋 Check trainer submissions queue for new submission')
print('=' * 60)
"

echo ""
echo "Done! Check Slack and trainer dashboard."
