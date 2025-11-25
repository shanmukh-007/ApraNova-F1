#!/usr/bin/env python
"""Check student progress"""
import os
import sys
import django

sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from curriculum.models import StudentProgress, Project

User = get_user_model()

# Get test user
user = User.objects.filter(email="test@gmail.com").first()

if not user:
    print("❌ Test user not found!")
    sys.exit(1)

print(f"✅ User: {user.email} (Track: {user.track})")
print(f"\n📊 Progress Summary:")

# Get all progress entries
all_progress = StudentProgress.objects.filter(student=user, step__isnull=False)
completed = all_progress.filter(is_completed=True)

print(f"   Total steps tracked: {all_progress.count()}")
print(f"   Completed steps: {completed.count()}")

# Check each project
projects = Project.objects.filter(track__code=user.track).order_by('number')

for project in projects:
    project_progress = StudentProgress.objects.filter(
        student=user,
        project=project,
        step__isnull=False
    )
    completed_steps = project_progress.filter(is_completed=True).count()
    total_steps = project.steps.count()
    percentage = (completed_steps / total_steps * 100) if total_steps > 0 else 0
    
    print(f"\n📁 Project {project.number}: {project.title}")
    print(f"   Steps: {completed_steps}/{total_steps} ({percentage:.0f}%)")
    
    if project_progress.exists():
        print(f"   Step details:")
        for p in project_progress.order_by('step__step_number'):
            status = "✓" if p.is_completed else "○"
            print(f"      {status} Step {p.step.step_number}: {p.step.title}")
