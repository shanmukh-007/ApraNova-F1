from django.db import models
from django.conf import settings


class PrivacyPolicy(models.Model):
    """Privacy policy versions"""
    version = models.CharField(max_length=20, unique=True)
    content = models.TextField()
    summary = models.TextField(blank=True)
    effective_date = models.DateTimeField()
    is_active = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-effective_date']
        verbose_name_plural = 'Privacy Policies'
    
    def __str__(self):
        return f"Privacy Policy v{self.version}"
    
    def save(self, *args, **kwargs):
        # Only one active policy at a time
        if self.is_active:
            PrivacyPolicy.objects.filter(is_active=True).update(is_active=False)
        super().save(*args, **kwargs)


class TermsOfService(models.Model):
    """Terms of service versions"""
    version = models.CharField(max_length=20, unique=True)
    content = models.TextField()
    summary = models.TextField(blank=True)
    effective_date = models.DateTimeField()
    is_active = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-effective_date']
        verbose_name_plural = 'Terms of Service'
    
    def __str__(self):
        return f"Terms of Service v{self.version}"
    
    def save(self, *args, **kwargs):
        # Only one active terms at a time
        if self.is_active:
            TermsOfService.objects.filter(is_active=True).update(is_active=False)
        super().save(*args, **kwargs)


class UserConsent(models.Model):
    """Track user consent to privacy policy and terms"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='consents')
    privacy_policy_version = models.CharField(max_length=20)
    terms_version = models.CharField(max_length=20)
    accepted_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-accepted_at']
    
    def __str__(self):
        return f"{self.user.email} - Privacy v{self.privacy_policy_version}, Terms v{self.terms_version}"


class AuditLog(models.Model):
    """Audit log for sensitive actions"""
    ACTION_CHOICES = [
        ('LOGIN', 'User Login'),
        ('LOGOUT', 'User Logout'),
        ('SIGNUP', 'User Signup'),
        ('PROFILE_UPDATE', 'Profile Update'),
        ('PASSWORD_CHANGE', 'Password Change'),
        ('DATA_EXPORT', 'Data Export Requested'),
        ('ACCOUNT_DELETE', 'Account Deletion Requested'),
        ('PAYMENT', 'Payment Made'),
        ('ENROLLMENT', 'Enrollment Status Change'),
        ('SUBMISSION', 'Project Submission'),
        ('GRADE', 'Grade Assigned'),
        ('ADMIN_ACTION', 'Admin Action'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='audit_logs'
    )
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    resource = models.CharField(max_length=200, blank=True)  # e.g., "Project 1", "User ID 123"
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    details = models.JSONField(default=dict, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['-timestamp']),
            models.Index(fields=['user', '-timestamp']),
            models.Index(fields=['action', '-timestamp']),
        ]
    
    def __str__(self):
        user_email = self.user.email if self.user else 'Anonymous'
        return f"{user_email} - {self.action} at {self.timestamp}"


class DataRetentionPolicy(models.Model):
    """Define data retention policies"""
    RESOURCE_TYPE_CHOICES = [
        ('LOGS', 'System Logs'),
        ('AUDIT_LOGS', 'Audit Logs'),
        ('USER_DATA', 'User Profile Data'),
        ('PAYMENT_DATA', 'Payment Records'),
        ('SUBMISSIONS', 'Project Submissions'),
        ('CERTIFICATES', 'Certificates'),
    ]
    
    resource_type = models.CharField(max_length=50, choices=RESOURCE_TYPE_CHOICES, unique=True)
    retention_days = models.IntegerField(help_text="Number of days to retain data")
    description = models.TextField()
    is_active = models.BooleanField(default=True)
    legal_requirement = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = 'Data Retention Policies'
    
    def __str__(self):
        return f"{self.resource_type} - {self.retention_days} days"
