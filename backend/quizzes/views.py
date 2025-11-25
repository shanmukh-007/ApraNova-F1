from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db import transaction
from .models import Quiz, Question, Answer, QuizAttempt, StudentAnswer
from .serializers import (
    QuizSerializer, QuizListSerializer, QuestionSerializer,
    QuizAttemptSerializer, GenerateQuizSerializer, StudentAnswerSerializer
)
from .ai_service import AIQuizGenerator


class QuizViewSet(viewsets.ModelViewSet):
    """ViewSet for managing quizzes"""
    queryset = Quiz.objects.filter(is_active=True)
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return QuizListSerializer
        return QuizSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.role in ['trainer', 'admin', 'superadmin']:
            return Quiz.objects.all()
        return Quiz.objects.filter(is_active=True)
    
    @action(detail=False, methods=['post'], url_path='generate')
    def generate_quiz(self, request):
        """Generate a new quiz using AI"""
        if request.user.role not in ['trainer', 'admin', 'superadmin']:
            return Response(
                {'error': 'Only trainers and admins can generate quizzes'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = GenerateQuizSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        ai_generator = AIQuizGenerator()
        
        try:
            # Generate questions using AI
            if data['generation_type'] == 'PROMPT':
                questions_data = ai_generator.generate_quiz_from_prompt(
                    data['prompt'],
                    data['num_questions']
                )
            else:  # WEB_SEARCH
                questions_data = ai_generator.generate_quiz_from_web_search(
                    data['prompt'],
                    data['num_questions']
                )
            
            # Create quiz and questions in a transaction
            with transaction.atomic():
                quiz = Quiz.objects.create(
                    title=data['title'],
                    description=f"AI-generated quiz based on: {data['prompt']}",
                    created_by=request.user,
                    generation_type=data['generation_type'],
                    prompt=data['prompt']
                )
                
                for idx, q_data in enumerate(questions_data):
                    question = Question.objects.create(
                        quiz=quiz,
                        question_text=q_data['question'],
                        question_type=q_data.get('type', 'SINGLE'),
                        order=idx + 1
                    )
                    
                    for ans_idx, ans_data in enumerate(q_data['answers']):
                        Answer.objects.create(
                            question=question,
                            answer_text=ans_data['text'],
                            is_correct=ans_data['correct'],
                            order=ans_idx + 1
                        )
            
            return Response(
                QuizSerializer(quiz).data,
                status=status.HTTP_201_CREATED
            )
            
        except Exception as e:
            return Response(
                {'error': f'Failed to generate quiz: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'], url_path='start')
    def start_quiz(self, request, pk=None):
        """Start a new quiz attempt for a student"""
        quiz = self.get_object()
        
        # Create new attempt
        attempt = QuizAttempt.objects.create(
            student=request.user,
            quiz=quiz,
            status='IN_PROGRESS'
        )
        
        return Response(
            QuizAttemptSerializer(attempt).data,
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=True, methods=['get'], url_path='attempts')
    def get_attempts(self, request, pk=None):
        """Get all attempts for a quiz"""
        quiz = self.get_object()
        
        if request.user.role in ['trainer', 'admin', 'superadmin']:
            attempts = quiz.attempts.all()
        else:
            attempts = quiz.attempts.filter(student=request.user)
        
        return Response(
            QuizAttemptSerializer(attempts, many=True).data
        )


class QuizAttemptViewSet(viewsets.ModelViewSet):
    """ViewSet for managing quiz attempts"""
    queryset = QuizAttempt.objects.all()
    serializer_class = QuizAttemptSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role in ['trainer', 'admin', 'superadmin']:
            return QuizAttempt.objects.all()
        return QuizAttempt.objects.filter(student=user)
    
    @action(detail=True, methods=['post'], url_path='answer')
    def submit_answer(self, request, pk=None):
        """Submit answer for a question"""
        attempt = self.get_object()
        
        if attempt.student != request.user:
            return Response(
                {'error': 'Not authorized'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if attempt.status == 'SUBMITTED':
            return Response(
                {'error': 'Quiz already submitted'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        question_id = request.data.get('question_id')
        answer_ids = request.data.get('answer_ids', [])
        
        if not question_id or not answer_ids:
            return Response(
                {'error': 'question_id and answer_ids required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            question = Question.objects.get(id=question_id, quiz=attempt.quiz)
            
            # Create or update student answer
            student_answer, created = StudentAnswer.objects.get_or_create(
                attempt=attempt,
                question=question
            )
            
            # Clear previous answers and add new ones
            student_answer.selected_answers.clear()
            student_answer.selected_answers.add(*answer_ids)
            
            # Check if answer is correct
            correct_answer_ids = set(
                question.answers.filter(is_correct=True).values_list('id', flat=True)
            )
            selected_answer_ids = set(answer_ids)
            student_answer.is_correct = (correct_answer_ids == selected_answer_ids)
            student_answer.save()
            
            return Response(
                StudentAnswerSerializer(student_answer).data,
                status=status.HTTP_200_OK
            )
            
        except Question.DoesNotExist:
            return Response(
                {'error': 'Question not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'], url_path='submit')
    def submit_quiz(self, request, pk=None):
        """Submit the entire quiz and calculate score"""
        attempt = self.get_object()
        
        if attempt.student != request.user:
            return Response(
                {'error': 'Not authorized'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if attempt.status == 'SUBMITTED':
            return Response(
                {'error': 'Quiz already submitted'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Calculate score
        total_questions = attempt.quiz.questions.count()
        correct_answers = attempt.student_answers.filter(is_correct=True).count()
        score = (correct_answers / total_questions * 100) if total_questions > 0 else 0
        
        # Update attempt
        attempt.status = 'SUBMITTED'
        attempt.score = score
        attempt.submitted_at = timezone.now()
        attempt.save()
        
        return Response(
            QuizAttemptSerializer(attempt).data,
            status=status.HTTP_200_OK
        )
