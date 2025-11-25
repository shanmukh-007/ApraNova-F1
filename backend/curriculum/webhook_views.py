"""
GitHub webhook handlers
"""
import hmac
import hashlib
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse, JsonResponse
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
import json
from .models import StudentProgress
from utils.slack import notify_pr_created, notify_pr_merged


def verify_github_signature(request):
    """
    Verify that the webhook request is from GitHub
    """
    if not hasattr(settings, 'GITHUB_WEBHOOK_SECRET') or not settings.GITHUB_WEBHOOK_SECRET:
        return True  # Skip verification if secret not configured
    
    signature = request.headers.get('X-Hub-Signature-256', '')
    if not signature:
        return False
    
    # Compute expected signature
    secret = settings.GITHUB_WEBHOOK_SECRET.encode()
    expected_signature = 'sha256=' + hmac.new(
        secret,
        request.body,
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(signature, expected_signature)


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def github_webhook(request):
    """
    Handle GitHub webhook events
    Supports: pull_request events
    Note: This endpoint is publicly accessible, authentication via signature verification
    """
    # Verify signature
    if not verify_github_signature(request):
        return JsonResponse({'error': 'Invalid signature'}, status=403)
    
    # Get event type
    event_type = request.headers.get('X-GitHub-Event', '')
    
    if event_type == 'ping':
        return JsonResponse({'message': 'Pong!'})
    
    if event_type != 'pull_request':
        return JsonResponse({'message': 'Event type not supported'})
    
    try:
        payload = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    
    # Handle pull request events
    action = payload.get('action')
    pr_data = payload.get('pull_request', {})
    repo_data = payload.get('repository', {})
    
    # Extract PR details
    pr_url = pr_data.get('html_url')
    pr_number = pr_data.get('number')
    pr_state = pr_data.get('state')
    pr_merged = pr_data.get('merged', False)
    repo_full_name = repo_data.get('full_name', '')
    
    # Find matching StudentProgress
    # Repo name format: username/repo-name
    if '/' in repo_full_name:
        repo_name = repo_full_name.split('/')[1]
        
        progress = StudentProgress.objects.filter(
            github_repo_name=repo_name,
            github_repo_created=True
        ).first()
        
        if not progress:
            return JsonResponse({
                'message': 'Repository not found in system',
                'repo': repo_name
            })
        
        student = progress.student
        project = progress.project
        
        # Handle different PR actions
        if action == 'opened':
            # PR created
            progress.github_pr_url = pr_url
            progress.github_pr_number = pr_number
            progress.save()
            
            # 🤖 AUTO-CREATE SUBMISSION
            from .models import Submission, Deliverable
            
            # Find the first deliverable for this project
            deliverable = Deliverable.objects.filter(project=project).first()
            
            if deliverable:
                # Check if submission already exists for this PR
                existing_submission = Submission.objects.filter(
                    student=student,
                    deliverable=deliverable,
                    github_pr_number=pr_number
                ).first()
                
                if not existing_submission:
                    # Create new submission automatically
                    submission = Submission.objects.create(
                        student=student,
                        deliverable=deliverable,
                        github_pr_url=pr_url,
                        github_pr_number=pr_number,
                        auto_created=True,
                        status='PENDING',
                        submission_text=f"Auto-submitted from PR #{pr_number}: {pr_data.get('title', '')}"
                    )
                    
                    # Send Slack notification
                    notify_pr_created(student, project, pr_url)
                    
                    return JsonResponse({
                        'message': 'PR opened and submission created automatically',
                        'student': student.get_full_name(),
                        'project': project.title,
                        'submission_id': submission.id,
                        'pr_number': pr_number
                    })
            
            # Fallback if no deliverable found
            notify_pr_created(student, project, pr_url)
            
            return JsonResponse({
                'message': 'PR opened event processed',
                'student': student.get_full_name(),
                'project': project.title
            })
        
        elif action == 'closed' and pr_merged:
            # PR merged
            progress.github_pr_merged = True
            progress.is_completed = True
            progress.completed_at = timezone.now()
            progress.save()
            
            # Auto-approve submission if exists
            from .models import Submission
            submission = Submission.objects.filter(
                student=student,
                deliverable__project=project,
                status='PENDING'
            ).first()
            
            if submission:
                submission.status = 'APPROVED'
                submission.feedback = 'Automatically approved - PR merged to main branch'
                submission.reviewed_by = student.assigned_trainer
                submission.reviewed_at = timezone.now()
                submission.save()
            
            # Unlock next project
            next_project = project.__class__.objects.filter(
                track=project.track,
                number=project.number + 1,
                is_active=True
            ).first()
            
            if next_project:
                # Create progress entry for next project to unlock it
                StudentProgress.objects.get_or_create(
                    student=student,
                    project=next_project,
                    step=None
                )
            
            # Send Slack notification
            notify_pr_merged(student, project)
            
            return JsonResponse({
                'message': 'PR merged event processed',
                'student': student.name,
                'project': project.title,
                'submission_approved': submission is not None,
                'next_project_unlocked': next_project is not None
            })
        
        else:
            return JsonResponse({
                'message': f'PR action {action} received but not processed'
            })
    
    return JsonResponse({'message': 'Webhook received'})
