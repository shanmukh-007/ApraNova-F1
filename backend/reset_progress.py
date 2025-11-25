#!/usr/bin/env python
"""Reset student progress to start fresh"""
import os
import sys
import django

sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from curriculum.models import StudentProgress

User = get_user_model()

# Get test user
user = User.objects.filter(email="test@gmail.com").first()

if not user:
    print("❌ Test user not found!")
    sys.exit(1)

print(f"✅ User: {user.email}")

# Reset all progress to incomplete
progress_entries = StudentProgress.objects.filter(
    student=user,
    step__isnull=False,
    is_completed=True
)

count = progress_entries.count()
progress_entries.update(is_completed=False, completed_at=None)

print(f"✅ Reset {count} completed steps to incomplete")
print(f"\n🎉 Progress reset! All projects now show 0% completion.")
print(f"   You can now test the flow from the beginning.")
