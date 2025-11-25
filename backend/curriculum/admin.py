from django.contrib import admin
from .models import Track, Project, ProjectStep, Deliverable, StudentProgress, Submission


@admin.register(Track)
class TrackAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'duration_weeks', 'is_active', 'created_at']
    list_filter = ['is_active', 'code']
    search_fields = ['name', 'description']


class ProjectStepInline(admin.TabularInline):
    model = ProjectStep
    extra = 1
    fields = ['step_number', 'title', 'estimated_minutes', 'order']


class DeliverableInline(admin.TabularInline):
    model = Deliverable
    extra = 1
    fields = ['title', 'deliverable_type', 'is_required', 'order']


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['track', 'number', 'title', 'project_type', 'estimated_hours', 'is_active']
    list_filter = ['track', 'project_type', 'is_active']
    search_fields = ['title', 'description']
    inlines = [ProjectStepInline, DeliverableInline]


@admin.register(ProjectStep)
class ProjectStepAdmin(admin.ModelAdmin):
    list_display = ['project', 'step_number', 'title', 'estimated_minutes', 'is_active']
    list_filter = ['project__track', 'is_active']
    search_fields = ['title', 'description']


@admin.register(Deliverable)
class DeliverableAdmin(admin.ModelAdmin):
    list_display = ['project', 'title', 'deliverable_type', 'is_required']
    list_filter = ['deliverable_type', 'is_required', 'project__track']
    search_fields = ['title', 'description']


@admin.register(StudentProgress)
class StudentProgressAdmin(admin.ModelAdmin):
    list_display = ['student', 'project', 'step', 'is_completed', 'completed_at']
    list_filter = ['is_completed', 'project__track', 'project']
    search_fields = ['student__email', 'student__name']
    date_hierarchy = 'completed_at'


@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = ['student', 'deliverable', 'status', 'submitted_at', 'reviewed_by']
    list_filter = ['status', 'deliverable__project__track']
    search_fields = ['student__email', 'student__name', 'deliverable__title']
    date_hierarchy = 'submitted_at'
    readonly_fields = ['submitted_at', 'updated_at']
