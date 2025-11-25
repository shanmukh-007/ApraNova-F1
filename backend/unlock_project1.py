#!/usr/bin/env python
"""Unlock Project 1 for test user"""
import os
import sys
import django

sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.utils import timezone
from curriculum.models import Track, Project, StudentProgress

User = get_user_model()

# Get test user
user = User.objects.get(email="test@gmail.com")
print(f"✅ Found user: {user.email} (Track: {user.track})")

# Get DP track and Project 1
track = Track.objects.get(code='DP')
project1 = track.projects.filter(number=1).first()

if not project1:
    print("❌ Project 1 not found!")
    sys.exit(1)

print(f"✅ Found Project 1: {project1.title}")

# Create progress entry for project (unlocks it)
progress, created = StudentProgress.objects.get_or_create(
    student=user,
    project=project1,
    step=None,
    defaults={'started_at': timezone.now()}
)

if created:
    print(f"✅ Unlocked Project 1 for {user.email}")
else:
    print(f"ℹ️  Project 1 already unlocked")

# Create progress entries for all steps
step_count = 0
for step in project1.steps.all():
    _, created = StudentProgress.objects.get_or_create(
        student=user,
        project=project1,
        step=step
    )
    if created:
        step_count += 1

print(f"✅ Created progress tracking for {step_count} steps")
print(f"\n🎉 Project 1 is now available on the dashboard!")
print(f"   Title: {project1.title}")
print(f"   Steps: {project1.steps.count()}")
print(f"   Deliverables: {project1.deliverables.count()}")
