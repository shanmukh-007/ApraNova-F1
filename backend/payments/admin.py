from django.contrib import admin
from .models import Payment, StripeCustomer


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = [
        'user', 
        'stripe_payment_intent', 
        'amount', 
        'currency', 
        'status', 
        'track',
        'refunded',
        'created_at'
    ]
    list_filter = ['status', 'track', 'refunded', 'created_at']
    search_fields = [
        'user__email', 
        'user__name', 
        'stripe_payment_intent', 
        'stripe_customer_id'
    ]
    readonly_fields = [
        'stripe_payment_intent',
        'stripe_customer_id',
        'stripe_charge_id',
        'created_at',
        'updated_at'
    ]
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('User Information', {
            'fields': ('user',)
        }),
        ('Payment Details', {
            'fields': (
                'stripe_payment_intent',
                'stripe_customer_id',
                'stripe_charge_id',
                'amount',
                'currency',
                'status',
                'track',
                'payment_method',
                'receipt_url',
            )
        }),
        ('Refund Information', {
            'fields': (
                'refunded',
                'refund_amount',
                'refund_reason',
                'refunded_at',
            )
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    def has_delete_permission(self, request, obj=None):
        # Prevent deletion of payment records (for audit purposes)
        return False


@admin.register(StripeCustomer)
class StripeCustomerAdmin(admin.ModelAdmin):
    list_display = ['user', 'stripe_customer_id', 'created_at']
    search_fields = ['user__email', 'user__name', 'stripe_customer_id']
    readonly_fields = ['stripe_customer_id', 'created_at', 'updated_at']
    
    def has_delete_permission(self, request, obj=None):
        # Prevent deletion of customer records
        return False
