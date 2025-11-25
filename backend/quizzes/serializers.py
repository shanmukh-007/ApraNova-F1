from rest_framework import serializers
from .models import Quiz, Question, Answer, QuizAttempt, StudentAnswer


class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ['id', 'answer_text', 'is_correct', 'order']
        read_only_fields = ['id']


class QuestionSerializer(serializers.ModelSerializer):
    answers = AnswerSerializer(many=True, read_only=True)
    
    class Meta:
        model = Question
        fields = ['id', 'question_text', 'question_type', 'order', 'answers']
        read_only_fields = ['id']


class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    created_by_name = serializers.CharField(source='created_by.name', read_only=True)
    question_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Quiz
        fields = [
            'id', 'title', 'description', 'created_by', 'created_by_name',
            'generation_type', 'prompt', 'is_active', 'created_at',
            'updated_at', 'questions', 'question_count'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']
    
    def get_question_count(self, obj):
        return obj.questions.count()


class QuizListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing quizzes"""
    created_by_name = serializers.CharField(source='created_by.name', read_only=True)
    question_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Quiz
        fields = [
            'id', 'title', 'description', 'created_by_name',
            'generation_type', 'is_active', 'created_at', 'question_count'
        ]
    
    def get_question_count(self, obj):
        return obj.questions.count()


class StudentAnswerSerializer(serializers.ModelSerializer):
    selected_answer_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True
    )
    
    class Meta:
        model = StudentAnswer
        fields = ['id', 'question', 'selected_answer_ids', 'is_correct', 'answered_at']
        read_only_fields = ['id', 'is_correct', 'answered_at']


class QuizAttemptSerializer(serializers.ModelSerializer):
    student_answers = StudentAnswerSerializer(many=True, read_only=True)
    quiz_title = serializers.CharField(source='quiz.title', read_only=True)
    student_name = serializers.CharField(source='student.name', read_only=True)
    
    class Meta:
        model = QuizAttempt
        fields = [
            'id', 'student', 'student_name', 'quiz', 'quiz_title',
            'status', 'score', 'started_at', 'submitted_at', 'student_answers'
        ]
        read_only_fields = ['id', 'student', 'score', 'started_at', 'submitted_at']


class GenerateQuizSerializer(serializers.Serializer):
    """Serializer for quiz generation request"""
    title = serializers.CharField(max_length=200)
    prompt = serializers.CharField()
    generation_type = serializers.ChoiceField(choices=['PROMPT', 'WEB_SEARCH'])
    num_questions = serializers.IntegerField(min_value=1, max_value=20, default=5)
