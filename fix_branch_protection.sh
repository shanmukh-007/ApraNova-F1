#!/bin/bash

echo "🔒 Fixing Branch Protection on All Organization Repos"
echo ""

sudo docker exec apranova_backend python manage.py shell -c "
from github import Github
from django.conf import settings

g = Github(settings.GITHUB_ORG_TOKEN)
org = g.get_organization(settings.GITHUB_ORGANIZATION)

print('🔍 Scanning all repositories in organization...')
print()

repos = list(org.get_repos())
student_repos = [r for r in repos if r.name.startswith('2025-')]

print(f'Found {len(student_repos)} student repositories')
print()

for repo in student_repos:
    print(f'📦 {repo.name}')
    
    try:
        # Check if main branch exists
        main_branch = repo.get_branch('main')
        
        # Check current protection status
        if main_branch.protected:
            print(f'   ✅ Already protected')
        else:
            print(f'   ⚠️  Not protected - Adding protection...')
            
            # Add protection
            main_branch.edit_protection(
                required_approving_review_count=1,
                enforce_admins=False,
                dismiss_stale_reviews=True,
                require_code_owner_reviews=False
            )
            print(f'   ✅ Protection added!')
            
    except Exception as e:
        print(f'   ❌ Error: {str(e)[:50]}')
    
    print()

print('=' * 60)
print('✅ Branch protection check complete!')
print('=' * 60)
"

echo ""
echo "Done! All repos should now have branch protection."
