#!/usr/bin/env python
"""
Script to unlock Project 2 for a DP student
This simulates completing Project 1 and moving to Project 2: Automated ETL Pipeline
"""

import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from accounts.models import CustomUser
from curriculum.models import Track, Project, StudentProgress

def unlock_project_2(email):
    """Unlock Project 2 for a DP student"""
    try:
        # Get the user
        user = CustomUser.objects.get(email=email)
        print(f"✅ Found user: {email}")
        
        if user.track != 'DP':
            print(f"❌ User is not in DP track (current track: {user.track})")
            return
        
        # Get DP track
        track = Track.objects.get(code='DP')
        
        # Get Project 1 and mark all steps as complete
        project1 = Project.objects.get(track=track, number=1)
        steps1 = project1.steps.all()
        
        print(f"\n📝 Marking Project 1 steps as complete...")
        for step in steps1:
            progress, created = StudentProgress.objects.get_or_create(
                student=user,
                project=project1,
                step=step,
                defaults={'is_completed': True}
            )
            if not progress.is_completed:
                progress.is_completed = True
                progress.save()
            print(f"   ✓ {step.title}")
        
        # Mark project 1 as unlocked
        project1_progress, _ = StudentProgress.objects.get_or_create(
            student=user,
            project=project1,
            step=None,
            defaults={'is_completed': False}
        )
        
        # Get Project 2 and unlock it
        project2 = Project.objects.get(track=track, number=2)
        project2_progress, created = StudentProgress.objects.get_or_create(
            student=user,
            project=project2,
            step=None,
            defaults={'is_completed': False}
        )
        
        print(f"\n🎉 Project 2 unlocked!")
        print(f"   Title: {project2.title}")
        print(f"   Description: {project2.description}")
        
        # Update user's current project (if you have this field)
        # user.current_project = 2
        # user.save()
        
        print(f"\n✅ User {email} is now on Project 2: Automated ETL Pipeline")
        print(f"\n🔧 New tools available:")
        print(f"   - Jupyter Lab (API extraction)")
        print(f"   - PostgreSQL (new schema)")
        print(f"   - Prefect (workflow orchestration)")
        print(f"   - Apache Superset (monitoring)")
        
    except CustomUser.DoesNotExist:
        print(f"❌ User not found: {email}")
    except Track.DoesNotExist:
        print(f"❌ DP track not found in database")
    except Project.DoesNotExist as e:
        print(f"❌ Project not found: {e}")
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    # Default to test user
    email = 'test@gmail.com'
    
    if len(sys.argv) > 1:
        email = sys.argv[1]
    
    print(f"🚀 Unlocking Project 2 for {email}...\n")
    unlock_project_2(email)
