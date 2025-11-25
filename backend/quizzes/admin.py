from django.contrib import admin
from .models import Quiz, Question, Answer, QuizAttempt, StudentAnswer


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ['title', 'created_by', 'generation_type', 'is_active', 'created_at']
    list_filter = ['generation_type', 'is_active', 'created_at']
    search_fields = ['title', 'description', 'prompt']


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ['quiz', 'question_text', 'question_type', 'order']
    list_filter = ['question_type', 'quiz']


@admin.register(Answer)
class AnswerAdmin(admin.ModelAdmin):
    list_display = ['question', 'answer_text', 'is_correct', 'order']
    list_filter = ['is_correct']


@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = ['student', 'quiz', 'status', 'score', 'started_at', 'submitted_at']
    list_filter = ['status', 'started_at']


@admin.register(StudentAnswer)
class StudentAnswerAdmin(admin.ModelAdmin):
    list_display = ['attempt', 'question', 'is_correct', 'answered_at']
    list_filter = ['is_correct']
