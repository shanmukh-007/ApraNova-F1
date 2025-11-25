from allauth.socialaccount.models import SocialAccount
from django.contrib.auth import get_user_model, authenticate
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from dj_rest_auth.registration.views import RegisterView
from .serializers import CustomRegisterSerializer
from .serializers import UserSerializer

User = get_user_model()


class CustomRegisterView(RegisterView):
    serializer_class = CustomRegisterSerializer
    
    def perform_create(self, serializer):
        """Override to get user instance after creation"""
        user = super().perform_create(serializer)
        # Store user for later use in create method
        self._created_user = user
        return user
    
    def create(self, request, *args, **kwargs):
        """Override create to add trainer assignment status in response"""
        response = super().create(request, *args, **kwargs)
        
        # Get the user that was just created
        user = getattr(self, '_created_user', None)
        
        # Add trainer assignment info for students
        if user and user.role == 'student':
            if user.assigned_trainer:
                response.data['trainer_assigned'] = True
                response.data['trainer_name'] = user.assigned_trainer.name or user.assigned_trainer.email
                response.data['message'] = f"Trainer {user.assigned_trainer.name or user.assigned_trainer.email} has been assigned to you"
            else:
                response.data['trainer_assigned'] = False
                response.data['message'] = "Your account has been created. A trainer will be assigned to you soon"
        
        return response

def get_tokens_for_user(user):
    """Generate JWT tokens for user"""
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    """Get current user profile"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_my_students(request):
    """Get list of students assigned to the trainer"""
    import logging
    from datetime import datetime, timedelta
    from django.utils import timezone
    from curriculum.models import Track, Project, StudentProgress
    
    logger = logging.getLogger(__name__)
    
    logger.info(f"get_my_students called by user: {request.user.email}, role: {request.user.role}")
    
    if request.user.role != 'trainer':
        logger.warning(f"Non-trainer tried to access: {request.user.email}")
        return Response(
            {"error": "Only trainers can access this endpoint"}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Get all students assigned to this trainer
    students = User.objects.filter(
        assigned_trainer=request.user,
        role='student'
    ).order_by('-created_at')
    
    logger.info(f"Found {students.count()} students for trainer {request.user.email}")
    
    # Serialize student data with real progress
    students_data = []
    for student in students:
        # Get student's track
        track_code = student.track
        current_project_title = None
        overall_progress = 0
        workflow_steps_completed = 0
        workflow_steps_total = 0
        
        if track_code:
            try:
                track = Track.objects.prefetch_related('projects__steps').get(code=track_code)
                
                # Get all projects in track ordered by number
                projects = track.projects.all().order_by('number')
                
                # Find current project - the latest unlocked project that student has started
                current_project = None
                has_started_any_project = False
                
                for project in projects:
                    total_steps = project.steps.count()
                    if total_steps == 0:
                        continue
                        
                    completed_steps = StudentProgress.objects.filter(
                        student=student,
                        project=project,
                        step__isnull=False,
                        is_completed=True
                    ).count()
                    
                    progress_pct = int((completed_steps / total_steps) * 100) if total_steps > 0 else 0
                    
                    # Check if student has started this project
                    if progress_pct > 0:
                        has_started_any_project = True
                    
                    # Check if this project is unlocked
                    is_unlocked = False
                    if project.number == 1:
                        is_unlocked = True
                    else:
                        # Check if previous project is completed
                        previous_project = projects.filter(number=project.number - 1).first()
                        if previous_project:
                            prev_total = previous_project.steps.count()
                            if prev_total > 0:
                                prev_completed = StudentProgress.objects.filter(
                                    student=student,
                                    project=previous_project,
                                    step__isnull=False,
                                    is_completed=True
                                ).count()
                                is_unlocked = (prev_completed == prev_total)
                    
                    # Current project is the latest unlocked project that student has started (progress > 0) and not 100% complete
                    if is_unlocked and progress_pct > 0 and progress_pct < 100:
                        current_project = project
                        overall_progress = progress_pct
                        workflow_steps_completed = completed_steps
                        workflow_steps_total = total_steps
                        # Don't break - keep looking for later unlocked projects
                
                # If student hasn't started any project, show "Not Started"
                if not has_started_any_project:
                    current_project_title = "Not Started"
                    overall_progress = 0
                    workflow_steps_completed = 0
                    workflow_steps_total = 0
                elif current_project:
                    current_project_title = current_project.title
                else:
                    # All projects completed - show 100% progress
                    current_project_title = "All Projects Completed"
                    overall_progress = 100
                    workflow_steps_completed = 0
                    workflow_steps_total = 0
                        
            except Track.DoesNotExist:
                logger.warning(f"Track {track_code} not found for student {student.email}")
        
        # Calculate status based on last login
        status_value = 'Inactive'
        last_active_text = 'Never'
        
        if student.last_login:
            time_diff = timezone.now() - student.last_login
            
            if time_diff < timedelta(hours=1):
                status_value = 'Active'
                last_active_text = 'Recently'
            elif time_diff < timedelta(days=1):
                status_value = 'Active'
                hours_ago = int(time_diff.total_seconds() / 3600)
                last_active_text = f'{hours_ago}h ago'
            elif time_diff < timedelta(days=7):
                status_value = 'Active'
                days_ago = time_diff.days
                last_active_text = f'{days_ago}d ago'
            else:
                status_value = 'Inactive'
                last_active_text = student.last_login.strftime('%b %d')
        
        students_data.append({
            'id': student.id,
            'name': student.name or student.username,
            'email': student.email,
            'track': student.track or 'Not Set',
            'progress': overall_progress,
            'current_project': current_project_title or 'No project',
            'workflow_steps': {
                'completed': workflow_steps_completed,
                'total': workflow_steps_total
            },
            'last_active': last_active_text,
            'status': status_value,
            'created_at': student.created_at.isoformat() if student.created_at else None,
        })
    
    logger.info(f"Returning {len(students_data)} students")
    return Response({
        'count': len(students_data),
        'students': students_data
    })


@api_view(["POST"])
@permission_classes([AllowAny])
def oauth_callback(request):
    """
    Handle OAuth callback from frontend
    This endpoint receives the JWT access token and returns user data
    """
    access_token = request.data.get("access_token")
    
    if not access_token:
        return Response(
            {"error": "Access token is required"}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Decode and validate JWT token
        from rest_framework_simplejwt.tokens import AccessToken
        
        token = AccessToken(access_token)
        user_id = token['user_id']
        user = User.objects.get(id=user_id)
        
        serializer = UserSerializer(user)
        return Response({
            "user": serializer.data,
            "access_token": access_token,
            "redirect_url": f"/{user.role}/dashboard",
        })
        
    except (TokenError, User.DoesNotExist) as e:
        return Response(
            {"error": "Invalid or expired token"}, 
            status=status.HTTP_401_UNAUTHORIZED
        )


@api_view(["POST"])
@permission_classes([AllowAny])
def social_login(request):
    """
    Handle social login (Google/GitHub)
    Accepts: provider (google/github), code, redirect_uri
    Returns: JWT tokens and user data
    """
    provider = request.data.get('provider')
    code = request.data.get('code')
    
    if not provider or not code:
        return Response(
            {"error": "Provider and code are required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Process OAuth with allauth
    # This is handled by dj-rest-auth automatically
    # Just return the response with tokens
    
    return Response({
        "message": "Use the dj-rest-auth endpoints for social login"
    })

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def update_user_role(request):
    """Update user role (for testing/admin purposes)"""
    role = request.data.get("role")

    if role not in ["student", "trainer", "admin", "superadmin"]:
        return Response({"error": "Invalid role"}, status=status.HTTP_400_BAD_REQUEST)

    request.user.role = role
    request.user.save()

    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def refresh_token(request):
    """Refresh JWT token"""
    refresh_token = request.data.get("refresh")
    
    if not refresh_token:
        return Response(
            {"error": "Refresh token is required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        refresh = RefreshToken(refresh_token)
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        })
    except TokenError:
        return Response(
            {"error": "Invalid refresh token"},
            status=status.HTTP_401_UNAUTHORIZED
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout(request):
    """Logout user by blacklisting refresh token"""
    refresh_token = request.data.get("refresh")
    
    if not refresh_token:
        return Response(
            {"error": "Refresh token is required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({"message": "Logout successful"})
    except TokenError:
        return Response(
            {"error": "Invalid token"},
            status=status.HTTP_400_BAD_REQUEST
        )
    

@api_view(["POST"])
@permission_classes([AllowAny])
def custom_login(request):
    email = request.data.get("email")
    password = request.data.get("password")
    role = request.data.get("role")  

    if not email or not password:
        return Response(
            {"error": "Email and password required"}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if not role:
        return Response(
            {"error": "Role is required"}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    # Authenticate user with credentials
    user = authenticate(request, username=email, password=password)
    if user is None:
        return Response(
            {"error": "Invalid credentials"}, 
            status=status.HTTP_401_UNAUTHORIZED
        )

    # Validate if selected role matches user's actual role
    # SuperAdmin can login with any role selection
    if user.role != role and user.role != "superadmin":
        return Response(
            {
                "error": "Unauthorized role access",
                "detail": f"You are registered as '{user.role}' but tried to login as '{role}'",
                "actual_role": user.role
            },
            status=status.HTTP_403_FORBIDDEN
        )

    # Generate tokens
    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)
    refresh_token = str(refresh)

    serializer = UserSerializer(user)

    return Response({
        "access": access_token,
        "refresh": refresh_token,
        "user": serializer.data,
        "redirect_url": f"/{user.role}/dashboard",
    })



@api_view(["POST"])
@permission_classes([AllowAny])
def check_email_exists(request):
    email = request.data.get("email", "").strip().lower()
    exists = User.objects.filter(email__iexact=email).exists()
    return Response({"exists": exists})

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """Health check endpoint for deployment monitoring"""
    return Response({"status": "healthy"}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_db_credentials(request):
    """Get database credentials for DP students"""
    user = request.user
    
    if user.track != 'DP':
        return Response(
            {"error": "Database credentials only available for DP track students"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        from .postgres_provisioning import PostgresProvisioningService
        from .models import StudentDatabaseCredentials
        
        credentials = PostgresProvisioningService.get_credentials(user)
        
        if not credentials:
            # Return mock credentials for development/demo
            # In production, this would trigger provisioning
            schema_name = f"dp_student_{user.id}"
            username = f"student_{user.id}"
            
            credentials = {
                'host': 'localhost',
                'port': '5432',
                'database': 'apranova_db',
                'schema_name': schema_name,
                'username': username,
                'password': '••••••••',  # Hidden for security
                'connection_string': f"postgresql://{username}:••••••••@localhost:5432/apranova_db?options=-c%20search_path={schema_name}"
            }
        
        return Response(credentials)
        
    except Exception as e:
        # Return mock credentials on error (for development)
        schema_name = f"dp_student_{user.id}"
        username = f"student_{user.id}"
        
        return Response({
            'host': 'localhost',
            'port': '5432',
            'database': 'apranova_db',
            'schema_name': schema_name,
            'username': username,
            'password': '••••••••',
            'connection_string': f"postgresql://{username}:••••••••@localhost:5432/apranova_db?options=-c%20search_path={schema_name}"
        })