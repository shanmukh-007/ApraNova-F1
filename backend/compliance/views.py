from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from .models import PrivacyPolicy, TermsOfService, UserConsent, AuditLog
from .serializers import PrivacyPolicySerializer, TermsOfServiceSerializer, UserConsentSerializer


def get_client_ip(request):
    """Extract client IP address from request"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def log_audit(user, action, resource='', details=None, request=None):
    """Helper function to create audit log entries"""
    ip_address = None
    user_agent = ''
    
    if request:
        ip_address = get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')
    
    AuditLog.objects.create(
        user=user,
        action=action,
        resource=resource,
        ip_address=ip_address,
        user_agent=user_agent,
        details=details or {}
    )


@api_view(['GET'])
@permission_classes([AllowAny])
def get_active_privacy_policy(request):
    """Get the currently active privacy policy"""
    policy = PrivacyPolicy.objects.filter(is_active=True).first()
    if not policy:
        return Response(
            {"error": "No active privacy policy found"}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    serializer = PrivacyPolicySerializer(policy)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_active_terms(request):
    """Get the currently active terms of service"""
    terms = TermsOfService.objects.filter(is_active=True).first()
    if not terms:
        return Response(
            {"error": "No active terms of service found"}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    serializer = TermsOfServiceSerializer(terms)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def accept_privacy_and_terms(request):
    """Record user acceptance of privacy policy and terms"""
    privacy_version = request.data.get('privacy_version')
    terms_version = request.data.get('terms_version')
    
    if not privacy_version or not terms_version:
        return Response(
            {"error": "Both privacy_version and terms_version are required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Create consent record
    consent = UserConsent.objects.create(
        user=request.user,
        privacy_policy_version=privacy_version,
        terms_version=terms_version,
        ip_address=get_client_ip(request),
        user_agent=request.META.get('HTTP_USER_AGENT', '')
    )
    
    # Update user model
    request.user.privacy_accepted = True
    request.user.privacy_accepted_at = timezone.now()
    request.user.privacy_version = privacy_version
    request.user.save()
    
    # Log audit
    log_audit(
        request.user, 
        'PROFILE_UPDATE', 
        'Privacy & Terms Acceptance',
        {'privacy_version': privacy_version, 'terms_version': terms_version},
        request
    )
    
    serializer = UserConsentSerializer(consent)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_consents(request):
    """Get all consent records for the current user"""
    consents = UserConsent.objects.filter(user=request.user)
    serializer = UserConsentSerializer(consents, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def request_data_export(request):
    """Request export of all user data (GDPR Right to Access)"""
    from django.contrib.auth import get_user_model
    from curriculum.models import StudentProgress, Submission
    from payments.models import Payment
    import json
    
    User = get_user_model()
    user = request.user
    
    # Collect all user data
    user_data = {
        'profile': {
            'id': user.id,
            'email': user.email,
            'name': user.name,
            'username': user.username,
            'role': user.role,
            'track': user.track,
            'enrollment_status': user.enrollment_status,
            'enrolled_at': user.enrolled_at.isoformat() if user.enrolled_at else None,
            'created_at': user.created_at.isoformat() if user.created_at else None,
            'privacy_accepted': user.privacy_accepted,
            'privacy_accepted_at': user.privacy_accepted_at.isoformat() if user.privacy_accepted_at else None,
        },
        'progress': list(StudentProgress.objects.filter(student=user).values(
            'project__title', 'step__title', 'is_completed', 'completed_at', 'github_repo_url'
        )),
        'submissions': list(Submission.objects.filter(student=user).values(
            'deliverable__title', 'submission_url', 'status', 'feedback', 'submitted_at'
        )),
        'payments': list(Payment.objects.filter(user=user).values(
            'stripe_payment_intent', 'amount', 'currency', 'status', 'created_at'
        )),
        'consents': list(UserConsent.objects.filter(user=user).values(
            'privacy_policy_version', 'terms_version', 'accepted_at'
        )),
        'audit_logs': list(AuditLog.objects.filter(user=user).values(
            'action', 'resource', 'timestamp'
        )[:100]),  # Last 100 logs
    }
    
    # Log the export request
    log_audit(user, 'DATA_EXPORT', 'Full data export', {}, request)
    
    return Response({
        'message': 'Data export generated',
        'data': user_data,
        'generated_at': timezone.now().isoformat()
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def request_account_deletion(request):
    """Request account deletion (GDPR Right to Erasure)"""
    user = request.user
    
    # Check if user has active enrollment
    if user.enrollment_status == 'ENROLLED':
        return Response(
            {
                "error": "Cannot delete account with active enrollment",
                "message": "Please contact support to withdraw from your course first"
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Mark account for deletion
    user.account_deletion_requested = True
    user.account_deletion_requested_at = timezone.now()
    user.save()
    
    # Log the deletion request
    log_audit(user, 'ACCOUNT_DELETE', 'Deletion requested', {}, request)
    
    return Response({
        'message': 'Account deletion requested',
        'deletion_date': (timezone.now() + timezone.timedelta(days=30)).isoformat(),
        'note': 'Your account will be deleted in 30 days. Contact support to cancel this request.'
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_account_deletion(request):
    """Cancel a pending account deletion request"""
    user = request.user
    
    if not user.account_deletion_requested:
        return Response(
            {"error": "No pending deletion request found"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user.account_deletion_requested = False
    user.account_deletion_requested_at = None
    user.save()
    
    log_audit(user, 'PROFILE_UPDATE', 'Deletion request cancelled', {}, request)
    
    return Response({'message': 'Account deletion request cancelled'})
