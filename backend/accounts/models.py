from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models

class CustomUserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError("The Email must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self._create_user(email, password, **extra_fields)


class CustomUser(AbstractUser):
    ROLE_CHOICES = [
        ("student", "Student"),
        ("trainer", "Trainer"),
        ("admin", "Admin"),
        ("superadmin", "SuperAdmin"),
    ]

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="student")
    name = models.CharField(max_length=150, blank=True)  
    track = models.CharField(max_length=50, blank=True)  
    profile_image = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Trainer assignment for students (max 20 students per trainer)
    assigned_trainer = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='students',
        limit_choices_to={'role': 'trainer'}
    )
    
    # GitHub Integration
    github_username = models.CharField(max_length=100, blank=True)
    github_access_token = models.CharField(max_length=255, blank=True)
    github_avatar = models.URLField(blank=True)
    github_connected = models.BooleanField(default=False)
    
    # GDPR & Privacy Compliance
    privacy_accepted = models.BooleanField(default=False)
    privacy_accepted_at = models.DateTimeField(null=True, blank=True)
    privacy_version = models.CharField(max_length=20, blank=True, default='1.0')
    data_retention_consent = models.BooleanField(default=True)
    marketing_consent = models.BooleanField(default=False)
    account_deletion_requested = models.BooleanField(default=False)
    account_deletion_requested_at = models.DateTimeField(null=True, blank=True)
    anonymized = models.BooleanField(default=False)
    
    # Enrollment Status
    ENROLLMENT_STATUS_CHOICES = [
        ('PENDING_PAYMENT', 'Pending Payment'),
        ('ENROLLED', 'Enrolled'),
        ('SUSPENDED', 'Suspended'),
        ('COMPLETED', 'Completed'),
        ('WITHDRAWN', 'Withdrawn'),
    ]
    enrollment_status = models.CharField(
        max_length=20, 
        choices=ENROLLMENT_STATUS_CHOICES, 
        default='PENDING_PAYMENT'
    )
    enrolled_at = models.DateTimeField(null=True, blank=True)
    graduation_date = models.DateTimeField(null=True, blank=True)
    payment_verified = models.BooleanField(default=False)
    
    # Tool Access URLs (provisioned after payment)
    workspace_url = models.URLField(blank=True)  # CodeServer for FSD
    superset_url = models.URLField(blank=True)   # Superset for DP
    prefect_url = models.URLField(blank=True)    # Prefect for DP
    jupyter_url = models.URLField(blank=True)    # Jupyter for DP
    
    # Tool Provisioning Status
    tools_provisioned = models.BooleanField(default=False)
    provisioned_at = models.DateTimeField(null=True, blank=True)
    provisioning_error = models.TextField(blank=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    objects = CustomUserManager()  # Use the custom manager

    def __str__(self):
        return self.email
    
    @property
    def student_count(self):
        """Get number of students assigned to this trainer"""
        if self.role == 'trainer':
            return self.students.filter(role='student').count()
        return 0
    
    @property
    def can_accept_students(self):
        """Check if trainer can accept more students (max 20)"""
        if self.role == 'trainer':
            return self.student_count < 20
        return False


class StudentDatabaseCredentials(models.Model):
    """Store database credentials for DP students"""
    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='db_credentials'
    )
    schema_name = models.CharField(max_length=100)
    username = models.CharField(max_length=100)
    password = models.CharField(max_length=255)  # Should be encrypted
    connection_string = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = 'Student Database Credentials'
    
    def __str__(self):
        return f"{self.user.email} - {self.schema_name}"