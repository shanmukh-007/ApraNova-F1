from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import Track, Project, ProjectStep, Deliverable, StudentProgress, Submission
from .serializers import (
    TrackSerializer, ProjectSerializer, ProjectStepSerializer,
    DeliverableSerializer, StudentProgressSerializer, SubmissionSerializer
)


class TrackViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for viewing learning tracks
    """
    queryset = Track.objects.filter(is_active=True)
    serializer_class = TrackSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=True, methods=['get'])
    def my_progress(self, request, pk=None):
        """Get student's progress for this track"""
        track = self.get_object()
        progress = StudentProgress.objects.filter(
            student=request.user,
            project__track=track
        ).select_related('project', 'step')
        serializer = StudentProgressSerializer(progress, many=True)
        return Response(serializer.data)


class ProjectViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for viewing projects
    """
    queryset = Project.objects.filter(is_active=True)
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        track_code = self.request.query_params.get('track', None)
        if track_code:
            queryset = queryset.filter(track__code=track_code)
        return queryset
    
    @action(detail=True, methods=['post'])
    def start_project(self, request, pk=None):
        """
        Start a project - creates GitHub repo from template
        """
        from .github_integration import create_repo_from_template
        
        project = self.get_object()
        student = request.user
        
        # Only students can start projects
        if student.role != 'student':
            return Response(
                {'error': 'Only students can start projects'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Create repo
        result = create_repo_from_template(student, project)
        
        if not result['success']:
            return Response(
                {'error': result['error']},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response(result)


class StudentProgressViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing student progress
    """
    serializer_class = StudentProgressSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return StudentProgress.objects.filter(student=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(student=self.request.user)
    
    @action(detail=False, methods=['post'])
    def mark_step_complete(self, request):
        """Mark a step as complete"""
        step_id = request.data.get('step_id')
        project_id = request.data.get('project_id')
        
        if not step_id or not project_id:
            return Response(
                {'error': 'step_id and project_id are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            step = ProjectStep.objects.get(id=step_id, project_id=project_id)
            project = step.project
        except ProjectStep.DoesNotExist:
            return Response(
                {'error': 'Step not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Create or update progress
        progress, created = StudentProgress.objects.update_or_create(
            student=request.user,
            project=project,
            step=step,
            defaults={
                'is_completed': True,
                'completed_at': timezone.now()
            }
        )
        
        serializer = self.get_serializer(progress)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'])
    def mark_step_incomplete(self, request):
        """Mark a step as incomplete"""
        step_id = request.data.get('step_id')
        project_id = request.data.get('project_id')
        
        if not step_id or not project_id:
            return Response(
                {'error': 'step_id and project_id are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            progress = StudentProgress.objects.get(
                student=request.user,
                project_id=project_id,
                step_id=step_id
            )
            progress.is_completed = False
            progress.completed_at = None
            progress.save()
            
            serializer = self.get_serializer(progress)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except StudentProgress.DoesNotExist:
            return Response(
                {'error': 'Progress not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class SubmissionViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing project submissions
    """
    serializer_class = SubmissionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role == 'trainer':
            # Trainers can see submissions from their students
            return Submission.objects.filter(
                student__assigned_trainer=self.request.user
            ).select_related('student', 'deliverable', 'reviewed_by')
        else:
            # Students can only see their own submissions
            return Submission.objects.filter(
                student=self.request.user
            ).select_related('deliverable', 'reviewed_by')
    
    def perform_create(self, serializer):
        serializer.save(student=self.request.user)
    
    @action(detail=True, methods=['post'])
    def review(self, request, pk=None):
        """Trainer reviews a submission"""
        if request.user.role != 'trainer':
            return Response(
                {'error': 'Only trainers can review submissions'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        submission = self.get_object()
        new_status = request.data.get('status')
        feedback = request.data.get('feedback', '')
        
        if new_status not in ['APPROVED', 'REJECTED']:
            return Response(
                {'error': 'Invalid status. Must be APPROVED or REJECTED'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        submission.status = new_status
        submission.feedback = feedback
        submission.reviewed_by = request.user
        submission.reviewed_at = timezone.now()
        submission.save()
        
        serializer = self.get_serializer(submission)
        return Response(serializer.data)
