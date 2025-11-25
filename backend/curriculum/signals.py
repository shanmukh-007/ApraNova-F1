"""
Django signals for curriculum events
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Submission, StudentProgress


@receiver(post_save, sender=Submission)
def submission_notifications(sender, instance, created, **kwargs):
    """
    Send notifications when submission is created or updated
    """
    from utils.slack import (
        notify_new_submission,
        notify_submission_approved,
        notify_submission_rejected
    )
    
    if created:
        # New submission created
        notify_new_submission(instance)
    else:
        # Submission updated - check if status changed
        if instance.status == 'APPROVED' and instance.reviewed_by:
            notify_submission_approved(instance)
        elif instance.status == 'REJECTED' and instance.reviewed_by:
            notify_submission_rejected(instance)


@receiver(post_save, sender=StudentProgress)
def project_start_notification(sender, instance, created, **kwargs):
    """
    Send notification when student starts a project
    """
    from utils.slack import notify_project_started
    
    # Only notify when repo is created for the first time
    if instance.github_repo_created and instance.github_repo_url:
        # Check if this is a new repo creation (not an update)
        if created or kwargs.get('update_fields') and 'github_repo_created' in kwargs.get('update_fields', []):
            notify_project_started(
                instance.student,
                instance.project,
                instance.github_repo_url
            )
