#!/usr/bin/env python
"""
Set workspace URL for FSD students
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from accounts.models import CustomUser

# Get all FSD students
fsd_students = CustomUser.objects.filter(track='FSD')

for student in fsd_students:
    # Set workspace URL to the shared code-server instance
    student.workspace_url = 'http://localhost:8080'
    student.tools_provisioned = True
    student.save()
    print(f"✓ Set workspace URL for {student.email}: {student.workspace_url}")

print(f"\n✓ Updated {fsd_students.count()} FSD students")
