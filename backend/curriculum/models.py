from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator


class Track(models.Model):
    """Learning track (Data Professional or Full-Stack Developer)"""
    TRACK_CHOICES = [
        ('DP', 'Data Professional'),
        ('FSD', 'Full-Stack Developer'),
    ]
    
    code = models.CharField(max_length=10, choices=TRACK_CHOICES, unique=True)
    name = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.CharField(max_length=50, default='code')  # Lucide icon name
    duration_weeks = models.IntegerField(default=12)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['code']
    
    def __str__(self):
        return self.name


class Project(models.Model):
    """Individual project within a track"""
    PROJECT_TYPE_CHOICES = [
        ('INTERNAL', 'Internal'),
        ('CAPSTONE', 'Capstone - External Cloud'),
    ]
    
    track = models.ForeignKey(Track, on_delete=models.CASCADE, related_name='projects')
    number = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(10)])
    title = models.CharField(max_length=200)
    subtitle = models.CharField(max_length=200, blank=True)
    description = models.TextField()
    project_type = models.CharField(max_length=20, choices=PROJECT_TYPE_CHOICES, default='INTERNAL')
    tech_stack = models.JSONField(default=list)  # List of technologies
    estimated_hours = models.IntegerField(default=40)
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    
    # GitHub Integration
    github_template_repo = models.CharField(
        max_length=200, 
        blank=True,
        help_text="GitHub template repo (e.g., 'apranova/react-portfolio-template')"
    )
    auto_create_repo = models.BooleanField(
        default=False,
        help_text="Automatically create GitHub repo when student starts project"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['track', 'order', 'number']
        unique_together = ['track', 'number']
    
    def __str__(self):
        return f"{self.track.code} - Project {self.number}: {self.title}"


class ProjectStep(models.Model):
    """Individual workflow step within a project"""
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='steps')
    step_number = models.IntegerField(validators=[MinValueValidator(1)])
    title = models.CharField(max_length=200)
    description = models.TextField()
    estimated_minutes = models.IntegerField(default=60)
    resources = models.JSONField(default=list)  # List of resource links/docs
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['project', 'order', 'step_number']
        unique_together = ['project', 'step_number']
    
    def __str__(self):
        return f"{self.project.title} - Step {self.step_number}: {self.title}"


class Deliverable(models.Model):
    """Expected deliverable/output for a project"""
    DELIVERABLE_TYPE_CHOICES = [
        ('LINK', 'Live Link/URL'),
        ('GITHUB', 'GitHub Repository'),
        ('FILE', 'File Upload (PDF/Doc)'),
        ('TEXT', 'Text/Description'),
    ]
    
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='deliverables')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    deliverable_type = models.CharField(max_length=20, choices=DELIVERABLE_TYPE_CHOICES)
    is_required = models.BooleanField(default=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['project', 'order']
    
    def __str__(self):
        return f"{self.project.title} - {self.title}"


class StudentProgress(models.Model):
    """Tracks student progress through projects and steps"""
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='progress')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='student_progress')
    step = models.ForeignKey(ProjectStep, on_delete=models.CASCADE, null=True, blank=True, related_name='student_progress')
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    
    # GitHub Integration
    github_repo_url = models.URLField(blank=True)
    github_repo_name = models.CharField(max_length=200, blank=True)
    github_repo_created = models.BooleanField(default=False)
    github_pr_url = models.URLField(blank=True)
    github_pr_number = models.IntegerField(null=True, blank=True)
    github_pr_merged = models.BooleanField(default=False)
    started_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['student', 'project', 'step']
        unique_together = ['student', 'project', 'step']
        verbose_name_plural = 'Student Progress'
    
    def __str__(self):
        if self.step:
            return f"{self.student.email} - {self.project.title} - Step {self.step.step_number}"
        return f"{self.student.email} - {self.project.title}"


class Submission(models.Model):
    """Student submission for project deliverables"""
    STATUS_CHOICES = [
        ('PENDING', 'Pending Review'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Needs Revision'),
    ]
    
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='submissions')
    deliverable = models.ForeignKey(Deliverable, on_delete=models.CASCADE, related_name='submissions')
    submission_url = models.URLField(blank=True)
    submission_text = models.TextField(blank=True)
    submission_file = models.CharField(max_length=500, blank=True)  # File path or URL
    
    # GitHub Integration
    github_pr_url = models.URLField(blank=True, help_text="GitHub Pull Request URL")
    github_pr_number = models.IntegerField(null=True, blank=True, help_text="GitHub PR number")
    auto_created = models.BooleanField(default=False, help_text="Auto-created from webhook")
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    feedback = models.TextField(blank=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='reviewed_submissions'
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-submitted_at']
    
    def __str__(self):
        return f"{self.student.email} - {self.deliverable.title} ({self.status})"
