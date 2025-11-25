from django.contrib import admin
from .models import ProjectSubmission


@admin.register(ProjectSubmission)
class ProjectSubmissionAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'student',
        'project_id',
        'deliverable_id',
        'deliverable_type',
        'status',
        'submitted_at',
        'reviewed_by',
    ]
    list_filter = ['status', 'deliverable_type', 'submitted_at']
    search_fields = ['student__email', 'student__name']
    readonly_fields = ['created_at', 'updated_at', 'submitted_at']
    
    fieldsets = (
        ('Submission Info', {
            'fields': ('student', 'project_id', 'deliverable_id', 'deliverable_type')
        }),
        ('Content', {
            'fields': ('url', 'file_path', 'text_content')
        }),
        ('Review', {
            'fields': ('status', 'submitted_at', 'reviewed_at', 'reviewed_by', 'trainer_feedback', 'grade')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
