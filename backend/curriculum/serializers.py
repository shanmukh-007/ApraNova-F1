from rest_framework import serializers
from .models import Track, Project, ProjectStep, Deliverable, StudentProgress, Submission


class DeliverableSerializer(serializers.ModelSerializer):
    class Meta:
        model = Deliverable
        fields = ['id', 'title', 'description', 'deliverable_type', 'is_required', 'order']


class ProjectStepSerializer(serializers.ModelSerializer):
    is_completed = serializers.SerializerMethodField()
    
    class Meta:
        model = ProjectStep
        fields = ['id', 'step_number', 'title', 'description', 'estimated_minutes', 
                  'resources', 'order', 'is_completed']
    
    def get_is_completed(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return StudentProgress.objects.filter(
                student=request.user,
                step=obj,
                is_completed=True
            ).exists()
        return False


class ProjectSerializer(serializers.ModelSerializer):
    steps = ProjectStepSerializer(many=True, read_only=True)
    deliverables = DeliverableSerializer(many=True, read_only=True)
    progress_percentage = serializers.SerializerMethodField()
    is_unlocked = serializers.SerializerMethodField()
    github_repo_url = serializers.SerializerMethodField()
    github_repo_name = serializers.SerializerMethodField()
    github_repo_created = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = ['id', 'number', 'title', 'subtitle', 'description', 'project_type',
                  'tech_stack', 'estimated_hours', 'steps', 'deliverables', 
                  'progress_percentage', 'is_unlocked', 'github_repo_url', 
                  'github_repo_name', 'github_repo_created']
    
    def get_progress_percentage(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            total_steps = obj.steps.count()
            if total_steps == 0:
                return 0
            completed_steps = StudentProgress.objects.filter(
                student=request.user,
                project=obj,
                step__isnull=False,
                is_completed=True
            ).count()
            return int((completed_steps / total_steps) * 100)
        return 0
    
    def get_is_unlocked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            # First project is always unlocked
            if obj.number == 1:
                return True
            
            # Check if previous project is completed
            previous_project = Project.objects.filter(
                track=obj.track,
                number=obj.number - 1
            ).first()
            
            if previous_project:
                total_steps = previous_project.steps.count()
                if total_steps == 0:
                    return True
                completed_steps = StudentProgress.objects.filter(
                    student=request.user,
                    project=previous_project,
                    step__isnull=False,
                    is_completed=True
                ).count()
                return completed_steps == total_steps
        return False
    
    def get_github_repo_url(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            progress = StudentProgress.objects.filter(
                student=request.user,
                project=obj,
                github_repo_created=True
            ).first()
            return progress.github_repo_url if progress else None
        return None
    
    def get_github_repo_name(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            progress = StudentProgress.objects.filter(
                student=request.user,
                project=obj,
                github_repo_created=True
            ).first()
            return progress.github_repo_name if progress else None
        return None
    
    def get_github_repo_created(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return StudentProgress.objects.filter(
                student=request.user,
                project=obj,
                github_repo_created=True
            ).exists()
        return False


class TrackSerializer(serializers.ModelSerializer):
    projects = ProjectSerializer(many=True, read_only=True)
    overall_progress = serializers.SerializerMethodField()
    
    class Meta:
        model = Track
        fields = ['id', 'code', 'name', 'description', 'icon', 'duration_weeks', 
                  'projects', 'overall_progress']
    
    def get_overall_progress(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            total_steps = ProjectStep.objects.filter(project__track=obj).count()
            if total_steps == 0:
                return 0
            completed_steps = StudentProgress.objects.filter(
                student=request.user,
                project__track=obj,
                step__isnull=False,
                is_completed=True
            ).count()
            return int((completed_steps / total_steps) * 100)
        return 0


class StudentProgressSerializer(serializers.ModelSerializer):
    project_title = serializers.CharField(source='project.title', read_only=True)
    step_title = serializers.CharField(source='step.title', read_only=True)
    
    class Meta:
        model = StudentProgress
        fields = ['id', 'project', 'project_title', 'step', 'step_title', 
                  'is_completed', 'completed_at', 'notes', 'created_at',
                  'github_repo_url', 'github_repo_name', 'github_repo_created',
                  'github_pr_url', 'github_pr_number', 'github_pr_merged', 'started_at']
        read_only_fields = ['completed_at', 'created_at', 'github_repo_created', 
                           'github_pr_merged', 'started_at']


class SubmissionSerializer(serializers.ModelSerializer):
    deliverable_title = serializers.CharField(source='deliverable.title', read_only=True)
    deliverable_type = serializers.CharField(source='deliverable.deliverable_type', read_only=True)
    project_title = serializers.CharField(source='deliverable.project.title', read_only=True)
    student_name = serializers.CharField(source='student.name', read_only=True)
    reviewer_name = serializers.CharField(source='reviewed_by.name', read_only=True)
    
    class Meta:
        model = Submission
        fields = ['id', 'deliverable', 'deliverable_title', 'deliverable_type', 'project_title', 
                  'submission_url', 'submission_text', 'submission_file', 'github_pr_url',
                  'status', 'feedback', 'student_name', 'reviewer_name',
                  'reviewed_at', 'submitted_at', 'updated_at']
        read_only_fields = ['student', 'reviewed_by', 'reviewed_at', 'submitted_at', 'updated_at']
