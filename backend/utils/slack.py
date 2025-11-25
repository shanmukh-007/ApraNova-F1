"""
Slack notification utilities
"""
import requests
from django.conf import settings


def send_slack_notification(message, blocks=None):
    """
    Send a simple message to Slack via webhook
    
    Args:
        message: Plain text message
        blocks: Optional rich formatting blocks
        
    Returns:
        bool: Success status
    """
    if not settings.SLACK_ENABLED or not settings.SLACK_WEBHOOK_URL:
        print(f"Slack disabled or not configured. Message: {message}")
        return False
    
    try:
        payload = {
            "text": message
        }
        
        if blocks:
            payload["blocks"] = blocks
        
        response = requests.post(
            settings.SLACK_WEBHOOK_URL,
            json=payload,
            timeout=5
        )
        
        return response.status_code == 200
        
    except Exception as e:
        print(f"Slack notification error: {e}")
        return False


def notify_project_started(student, project, repo_url):
    """
    Notify when student starts a project
    """
    message = f"🚀 *{student.name}* started *{project.title}*"
    
    blocks = [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": f"🚀 *Project Started*\n\n*Student:* {student.name}\n*Project:* {project.title}\n*Track:* {student.track}\n*Repository:* <{repo_url}|View on GitHub>"
            }
        }
    ]
    
    if student.assigned_trainer:
        blocks.append({
            "type": "context",
            "elements": [
                {
                    "type": "mrkdwn",
                    "text": f"👤 Assigned Trainer: {student.assigned_trainer.name}"
                }
            ]
        })
    
    return send_slack_notification(message, blocks)


def notify_new_submission(submission):
    """
    Notify trainer when student submits a deliverable
    """
    student = submission.student
    project = submission.deliverable.project
    trainer = student.assigned_trainer
    
    message = f"🎉 New submission from {student.name}"
    
    blocks = [
        {
            "type": "header",
            "text": {
                "type": "plain_text",
                "text": "🎉 New Submission"
            }
        },
        {
            "type": "section",
            "fields": [
                {
                    "type": "mrkdwn",
                    "text": f"*Student:*\n{student.name}"
                },
                {
                    "type": "mrkdwn",
                    "text": f"*Project:*\n{project.title}"
                },
                {
                    "type": "mrkdwn",
                    "text": f"*Deliverable:*\n{submission.deliverable.title}"
                },
                {
                    "type": "mrkdwn",
                    "text": f"*Trainer:*\n{trainer.name if trainer else 'Not assigned'}"
                }
            ]
        }
    ]
    
    # Add submission links
    if submission.submission_url:
        blocks.append({
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": f"*Submission URL:*\n<{submission.submission_url}|View Submission>"
            }
        })
    
    if submission.github_pr_url:
        blocks.append({
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": f"*Pull Request:*\n<{submission.github_pr_url}|Review PR on GitHub>"
            }
        })
    
    # Add action buttons
    platform_url = settings.FRONTEND_URL if hasattr(settings, 'FRONTEND_URL') else 'http://localhost:3000'
    blocks.append({
        "type": "actions",
        "elements": [
            {
                "type": "button",
                "text": {
                    "type": "plain_text",
                    "text": "Review Now"
                },
                "url": f"{platform_url}/trainer/submissions",
                "style": "primary"
            }
        ]
    })
    
    return send_slack_notification(message, blocks)


def notify_submission_approved(submission):
    """
    Notify student when submission is approved
    """
    student = submission.student
    project = submission.deliverable.project
    reviewer = submission.reviewed_by
    
    message = f"✅ Your submission for {project.title} was approved!"
    
    blocks = [
        {
            "type": "header",
            "text": {
                "type": "plain_text",
                "text": "✅ Submission Approved"
            }
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": f"*Congratulations {student.name}!*\n\nYour submission for *{project.title}* has been approved."
            }
        },
        {
            "type": "section",
            "fields": [
                {
                    "type": "mrkdwn",
                    "text": f"*Project:*\n{project.title}"
                },
                {
                    "type": "mrkdwn",
                    "text": f"*Deliverable:*\n{submission.deliverable.title}"
                },
                {
                    "type": "mrkdwn",
                    "text": f"*Reviewed by:*\n{reviewer.name if reviewer else 'Unknown'}"
                }
            ]
        }
    ]
    
    if submission.feedback:
        blocks.append({
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": f"*Feedback:*\n{submission.feedback}"
            }
        })
    
    return send_slack_notification(message, blocks)


def notify_submission_rejected(submission):
    """
    Notify student when submission needs revision
    """
    student = submission.student
    project = submission.deliverable.project
    reviewer = submission.reviewed_by
    
    message = f"⚠️ Your submission for {project.title} needs revision"
    
    blocks = [
        {
            "type": "header",
            "text": {
                "type": "plain_text",
                "text": "⚠️ Changes Requested"
            }
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": f"Hi {student.name},\n\nYour submission for *{project.title}* needs some revisions."
            }
        },
        {
            "type": "section",
            "fields": [
                {
                    "type": "mrkdwn",
                    "text": f"*Project:*\n{project.title}"
                },
                {
                    "type": "mrkdwn",
                    "text": f"*Deliverable:*\n{submission.deliverable.title}"
                },
                {
                    "type": "mrkdwn",
                    "text": f"*Reviewed by:*\n{reviewer.name if reviewer else 'Unknown'}"
                }
            ]
        }
    ]
    
    if submission.feedback:
        blocks.append({
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": f"*Feedback:*\n{submission.feedback}"
            }
        })
    
    # Add action button
    platform_url = settings.FRONTEND_URL if hasattr(settings, 'FRONTEND_URL') else 'http://localhost:3000'
    blocks.append({
        "type": "actions",
        "elements": [
            {
                "type": "button",
                "text": {
                    "type": "plain_text",
                    "text": "View Feedback"
                },
                "url": f"{platform_url}/student/submissions",
                "style": "primary"
            }
        ]
    })
    
    return send_slack_notification(message, blocks)


def notify_pr_created(student, project, pr_url):
    """
    Notify when student creates a PR
    """
    message = f"📝 {student.name} created a Pull Request for {project.title}"
    
    blocks = [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": f"📝 *Pull Request Created*\n\n*Student:* {student.name}\n*Project:* {project.title}\n*PR:* <{pr_url}|Review on GitHub>"
            }
        }
    ]
    
    if student.assigned_trainer:
        blocks.append({
            "type": "context",
            "elements": [
                {
                    "type": "mrkdwn",
                    "text": f"👤 Assigned Trainer: {student.assigned_trainer.name}"
                }
            ]
        })
    
    return send_slack_notification(message, blocks)


def notify_pr_merged(student, project):
    """
    Notify when PR is merged (project completed)
    """
    message = f"🎊 {student.name} completed {project.title}!"
    
    blocks = [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": f"🎊 *Project Completed*\n\n*Student:* {student.name}\n*Project:* {project.title}\n\nPull Request has been merged to main branch!"
            }
        }
    ]
    
    return send_slack_notification(message, blocks)


def send_slack_message(message):
    """
    Send a simple test message to Slack
    Used for testing Slack integration
    """
    return send_slack_notification(message)
