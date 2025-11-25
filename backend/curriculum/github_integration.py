"""
GitHub integration utilities for curriculum
"""
from github import Github, GithubException
from django.conf import settings
from django.utils import timezone
from .models import StudentProgress


def create_repo_from_template(student, project):
    """
    Create a GitHub repository from template for a student's project
    
    Args:
        student: CustomUser instance (student)
        project: Project instance
        
    Returns:
        dict: Repository details or error
    """
    # Check if student has GitHub connected
    if not student.github_connected or not student.github_access_token:
        return {
            'success': False,
            'error': 'GitHub account not connected'
        }
    
    # Check if project has template configured
    if not project.github_template_repo or not project.auto_create_repo:
        return {
            'success': False,
            'error': 'Project does not have GitHub template configured'
        }
    
    # Check if repo already created
    existing_progress = StudentProgress.objects.filter(
        student=student,
        project=project,
        github_repo_created=True
    ).first()
    
    if existing_progress:
        return {
            'success': True,
            'already_exists': True,
            'repo_url': existing_progress.github_repo_url,
            'repo_name': existing_progress.github_repo_name
        }
    
    try:
        # Determine if using organization or student account
        use_org = settings.GITHUB_USE_ORGANIZATION and settings.GITHUB_ORG_TOKEN
        
        if use_org:
            # Use organization token
            g = Github(settings.GITHUB_ORG_TOKEN)
            org = g.get_organization(settings.GITHUB_ORGANIZATION)
            
            # Create repo name with better convention
            # Format: 2025-fsd-username-project-slug
            from datetime import datetime
            year = datetime.now().year
            track_code = project.track.code.lower() if hasattr(project, 'track') else 'gen'
            project_slug = project.title.lower().replace(' ', '-')
            repo_name = f"{year}-{track_code}-{student.github_username}-{project_slug}"
        else:
            # Use student's token (current method)
            g = Github(student.github_access_token)
            user = g.get_user()
            repo_name = f"{student.github_username}-{project.title.lower().replace(' ', '-')}"
        
        # Get template repo
        template_owner, template_name = project.github_template_repo.split('/')
        template_repo = g.get_repo(f"{template_owner}/{template_name}")
        
        # Create repo from template
        if use_org:
            new_repo = org.create_repo_from_template(
                name=repo_name,
                repo=template_repo,
                description=f"{project.title} - {student.get_full_name()} - ApraNova Bootcamp",
                private=False
            )
            
            # Add student as collaborator with WRITE access
            try:
                new_repo.add_to_collaborators(
                    student.github_username,
                    permission='push'
                )
            except GithubException as e:
                print(f"Warning: Could not add student as collaborator: {e}")
        else:
            new_repo = user.create_repo_from_template(
                name=repo_name,
                repo=template_repo,
                description=f"{project.title} - ApraNova Bootcamp Project",
                private=False
            )
        
        # Add trainer as collaborator if assigned
        if student.assigned_trainer and student.assigned_trainer.github_connected:
            try:
                new_repo.add_to_collaborators(
                    student.assigned_trainer.github_username,
                    permission='push'
                )
            except GithubException as e:
                print(f"Warning: Could not add trainer as collaborator: {e}")
        
        # Setup webhook for automatic PR detection
        try:
            webhook_url = f"{settings.BACKEND_URL}/api/curriculum/github/webhook/"
            new_repo.create_hook(
                name='web',
                config={
                    'url': webhook_url,
                    'content_type': 'json',
                    'secret': settings.GITHUB_WEBHOOK_SECRET,
                },
                events=['pull_request', 'push'],
                active=True
            )
        except GithubException as e:
            print(f"Warning: Could not setup webhook: {e}")
        
        # Protect main branch
        try:
            main_branch = new_repo.get_branch('main')
            main_branch.edit_protection(
                required_approving_review_count=1,
                enforce_admins=False,
                dismiss_stale_reviews=True,
                require_code_owner_reviews=False
            )
            print(f"✅ Branch protection enabled on {new_repo.name}")
        except GithubException as e:
            print(f"Warning: Could not protect main branch: {e}")
        
        # Create develop branch
        try:
            main_ref = new_repo.get_git_ref('heads/main')
            new_repo.create_git_ref(
                ref='refs/heads/develop',
                sha=main_ref.object.sha
            )
        except GithubException as e:
            print(f"Warning: Could not create develop branch: {e}")
        
        # Save to database
        progress, created = StudentProgress.objects.get_or_create(
            student=student,
            project=project,
            step=None  # Project-level progress
        )
        progress.github_repo_url = new_repo.html_url
        progress.github_repo_name = repo_name
        progress.github_repo_created = True
        progress.started_at = timezone.now()
        progress.save()
        
        return {
            'success': True,
            'repo_url': new_repo.html_url,
            'repo_name': repo_name,
            'clone_url': new_repo.clone_url,
            'ssh_url': new_repo.ssh_url
        }
        
    except GithubException as e:
        return {
            'success': False,
            'error': f'GitHub API error: {str(e)}'
        }
    except Exception as e:
        return {
            'success': False,
            'error': f'Unexpected error: {str(e)}'
        }


def detect_pr_from_repo(student, project):
    """
    Detect if student has created a PR for the project
    
    Args:
        student: CustomUser instance
        project: Project instance
        
    Returns:
        dict: PR details or None
    """
    if not student.github_connected or not student.github_access_token:
        return None
    
    progress = StudentProgress.objects.filter(
        student=student,
        project=project,
        github_repo_created=True
    ).first()
    
    if not progress or not progress.github_repo_name:
        return None
    
    try:
        g = Github(student.github_access_token)
        repo = g.get_repo(f"{student.github_username}/{progress.github_repo_name}")
        
        # Get open PRs from develop to main
        pulls = repo.get_pulls(state='open', base='main', head='develop')
        
        for pr in pulls:
            return {
                'pr_url': pr.html_url,
                'pr_number': pr.number,
                'pr_title': pr.title,
                'pr_state': pr.state,
                'created_at': pr.created_at
            }
        
        return None
        
    except GithubException:
        return None
