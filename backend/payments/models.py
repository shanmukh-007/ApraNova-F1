from django.conf import settings
from django.db import models


class Payment(models.Model):
    """Payment records for student enrollments"""
    STATUS_CHOICES = [
        ('CREATED', 'Created'),
        ('PROCESSING', 'Processing'),
        ('SUCCEEDED', 'Succeeded'),
        ('FAILED', 'Failed'),
        ('CANCELED', 'Canceled'),
        ('REFUNDED', 'Refunded'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        related_name='payments',
        null=True,  # Allow null for anonymous checkout
        blank=True
    )
    
    # For anonymous checkout (before account creation)
    customer_email = models.EmailField(blank=True, default='')
    customer_name = models.CharField(max_length=200, blank=True, default='')
    stripe_payment_intent = models.CharField(max_length=255, unique=True)
    stripe_customer_id = models.CharField(max_length=255, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default="usd")
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default="CREATED")
    
    # Track metadata
    track = models.CharField(max_length=10, blank=True)  # DP or FSD
    payment_method = models.CharField(max_length=50, blank=True)  # card, etc.
    
    # Stripe metadata
    stripe_charge_id = models.CharField(max_length=255, blank=True)
    receipt_url = models.URLField(blank=True)
    
    # Refund tracking
    refunded = models.BooleanField(default=False)
    refund_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    refund_reason = models.TextField(blank=True)
    refunded_at = models.DateTimeField(null=True, blank=True)
    
    # Account creation tracking (for payment-first flow)
    account_created = models.BooleanField(default=False)
    tools_provisioned = models.BooleanField(default=False)
    provisioning_error = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.stripe_payment_intent} - {self.status}"


class StripeCustomer(models.Model):
    """Store Stripe customer IDs for users"""
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='stripe_customer'
    )
    stripe_customer_id = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.email} - {self.stripe_customer_id}"
