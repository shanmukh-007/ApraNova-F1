from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from .models import ProjectSubmission
from .serializers import ProjectSubmissionSerializer, SubmissionCreateSerializer


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def submission_list_create(request):
    """List all submissions for the current user or create a new one"""
    
    if request.method == 'GET':
        # Get all submissions for the current user
        submissions = ProjectSubmission.objects.filter(student=request.user)
        
        # Optional filters
        project_id = request.query_params.get('project_id')
        if project_id:
            submissions = submissions.filter(project_id=project_id)
        
        serializer = ProjectSubmissionSerializer(submissions, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        # Create or update submission
        serializer = SubmissionCreateSerializer(data=request.data)
        
        if serializer.is_valid():
            project_id = serializer.validated_data['project_id']
            deliverable_id = serializer.validated_data['deliverable_id']
            
            # Check if submission already exists
            submission, created = ProjectSubmission.objects.update_or_create(
                student=request.user,
                project_id=project_id,
                deliverable_id=deliverable_id,
                defaults={
                    **serializer.validated_data,
                    'status': 'DRAFT',
                }
            )
            
            response_serializer = ProjectSubmissionSerializer(submission)
            return Response(
                response_serializer.data,
                status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def submission_detail(request, pk):
    """Retrieve, update or delete a submission"""
    
    try:
        submission = ProjectSubmission.objects.get(pk=pk, student=request.user)
    except ProjectSubmission.DoesNotExist:
        return Response(
            {'error': 'Submission not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if request.method == 'GET':
        serializer = ProjectSubmissionSerializer(submission)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = SubmissionCreateSerializer(submission, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            response_serializer = ProjectSubmissionSerializer(submission)
            return Response(response_serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        # Only allow deletion of draft submissions
        if submission.status != 'DRAFT':
            return Response(
                {'error': 'Cannot delete submitted work'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        submission.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_for_review(request, pk):
    """Submit a draft for trainer review"""
    
    try:
        submission = ProjectSubmission.objects.get(pk=pk, student=request.user)
    except ProjectSubmission.DoesNotExist:
        return Response(
            {'error': 'Submission not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if submission.status != 'DRAFT':
        return Response(
            {'error': 'Only draft submissions can be submitted'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Update status
    submission.status = 'SUBMITTED'
    submission.submitted_at = timezone.now()
    submission.save()
    
    serializer = ProjectSubmissionSerializer(submission)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def project_submissions(request, project_id):
    """Get all submissions for a specific project"""
    
    submissions = ProjectSubmission.objects.filter(
        student=request.user,
        project_id=project_id
    )
    
    serializer = ProjectSubmissionSerializer(submissions, many=True)
    return Response(serializer.data)
