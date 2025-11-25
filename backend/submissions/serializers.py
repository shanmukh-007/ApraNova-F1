from rest_framework import serializers
from .models import ProjectSubmission


class ProjectSubmissionSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)
    student_email = serializers.CharField(source='student.email', read_only=True)
    reviewer_name = serializers.CharField(source='reviewed_by.name', read_only=True, allow_null=True)
    
    class Meta:
        model = ProjectSubmission
        fields = [
            'id',
            'student',
            'student_name',
            'student_email',
            'project_id',
            'deliverable_id',
            'deliverable_type',
            'url',
            'file_path',
            'text_content',
            'status',
            'submitted_at',
            'reviewed_at',
            'reviewed_by',
            'reviewer_name',
            'trainer_feedback',
            'grade',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['student', 'submitted_at', 'reviewed_at', 'reviewed_by']


class SubmissionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectSubmission
        fields = [
            'project_id',
            'deliverable_id',
            'deliverable_type',
            'url',
            'file_path',
            'text_content',
        ]
    
    def validate(self, data):
        deliverable_type = data.get('deliverable_type')
        
        # Validate based on type
        if deliverable_type in ['LINK', 'GITHUB']:
            if not data.get('url'):
                raise serializers.ValidationError("URL is required for this deliverable type")
        elif deliverable_type == 'FILE':
            if not data.get('file_path'):
                raise serializers.ValidationError("File is required for this deliverable type")
        elif deliverable_type == 'TEXT':
            if not data.get('text_content'):
                raise serializers.ValidationError("Text content is required for this deliverable type")
        
        return data
