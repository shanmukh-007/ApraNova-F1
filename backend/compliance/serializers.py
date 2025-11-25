from rest_framework import serializers
from .models import PrivacyPolicy, TermsOfService, UserConsent, AuditLog


class PrivacyPolicySerializer(serializers.ModelSerializer):
    class Meta:
        model = PrivacyPolicy
        fields = ['id', 'version', 'content', 'summary', 'effective_date', 'is_active']
        read_only_fields = ['id']


class TermsOfServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = TermsOfService
        fields = ['id', 'version', 'content', 'summary', 'effective_date', 'is_active']
        read_only_fields = ['id']


class UserConsentSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = UserConsent
        fields = ['id', 'user_email', 'privacy_policy_version', 'terms_version', 'accepted_at', 'ip_address']
        read_only_fields = ['id', 'accepted_at']


class AuditLogSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = AuditLog
        fields = ['id', 'user_email', 'action', 'resource', 'ip_address', 'timestamp', 'details']
        read_only_fields = ['id', 'timestamp']
