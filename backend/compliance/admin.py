from django.contrib import admin
from .models import PrivacyPolicy, TermsOfService, UserConsent, AuditLog, DataRetentionPolicy


@admin.register(PrivacyPolicy)
class PrivacyPolicyAdmin(admin.ModelAdmin):
    list_display = ['version', 'effective_date', 'is_active', 'created_at']
    list_filter = ['is_active', 'effective_date']
    search_fields = ['version', 'content']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(TermsOfService)
class TermsOfServiceAdmin(admin.ModelAdmin):
    list_display = ['version', 'effective_date', 'is_active', 'created_at']
    list_filter = ['is_active', 'effective_date']
    search_fields = ['version', 'content']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(UserConsent)
class UserConsentAdmin(admin.ModelAdmin):
    list_display = ['user', 'privacy_policy_version', 'terms_version', 'accepted_at', 'ip_address']
    list_filter = ['accepted_at', 'privacy_policy_version', 'terms_version']
    search_fields = ['user__email', 'user__name']
    readonly_fields = ['accepted_at']


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'action', 'resource', 'ip_address', 'timestamp']
    list_filter = ['action', 'timestamp']
    search_fields = ['user__email', 'resource', 'ip_address']
    readonly_fields = ['timestamp']
    date_hierarchy = 'timestamp'


@admin.register(DataRetentionPolicy)
class DataRetentionPolicyAdmin(admin.ModelAdmin):
    list_display = ['resource_type', 'retention_days', 'is_active', 'legal_requirement']
    list_filter = ['is_active', 'legal_requirement']
    search_fields = ['resource_type', 'description']
