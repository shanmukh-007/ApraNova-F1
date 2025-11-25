from django.db import models
from accounts.models import CustomUser


class ProjectSubmission(models.Model):
    """Student submissions for project deliverables"""
    
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('SUBMITTED', 'Submitted'),
        ('UNDER_REVIEW', 'Under Review'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('REVISION_REQUESTED', 'Revision Requested'),
    ]
    
    student = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='project_submissions'
    )
    project_id = models.IntegerField()  # References curriculum project
    deliverable_id = models.IntegerField()  # References curriculum deliverable
    deliverable_type = models.CharField(max_length=20)  # LINK, GITHUB, FILE, TEXT
    
    # Submission content (based on type)
    url = models.URLField(blank=True)  # For LINK and GITHUB types
    file_path = models.CharField(max_length=500, blank=True)  # For FILE type
    text_content = models.TextField(blank=True)  # For TEXT type
    
    # Status and review
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    submitted_at = models.DateTimeField(null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_project_submissions'
    )
    
    # Feedback
    trainer_feedback = models.TextField(blank=True)
    grade = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ['student', 'project_id', 'deliverable_id']
    
    def __str__(self):
        return f"{self.student.email} - Project {self.project_id} - Deliverable {self.deliverable_id}"
