from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from .models import Quiz, Question, Answer, QuizAttempt, StudentAnswer

User = get_user_model()


class QuizModelTests(TestCase):
    def setUp(self):
        self.trainer = User.objects.create_user(
            email='trainer@test.com',
            username='trainer',
            password='testpass123',
            role='trainer'
        )
        self.student = User.objects.create_user(
            email='student@test.com',
            username='student',
            password='testpass123',
            role='student'
        )

    def test_create_quiz(self):
        """Test creating a quiz"""
        quiz = Quiz.objects.create(
            title='Test Quiz',
            description='Test Description',
            created_by=self.trainer,
            generation_type='PROMPT',
            prompt='Test prompt'
        )
        self.assertEqual(quiz.title, 'Test Quiz')
        self.assertEqual(quiz.created_by, self.trainer)

    def test_create_question(self):
        """Test creating a question"""
        quiz = Quiz.objects.create(
            title='Test Quiz',
            created_by=self.trainer,
            generation_type='PROMPT',
            prompt='Test'
        )
        question = Question.objects.create(
            quiz=quiz,
            question_text='What is 2+2?',
            question_type='SINGLE',
            order=1
        )
        self.assertEqual(question.quiz, quiz)
        self.assertEqual(question.question_text, 'What is 2+2?')

    def test_create_answer(self):
        """Test creating an answer"""
        quiz = Quiz.objects.create(
            title='Test Quiz',
            created_by=self.trainer,
            generation_type='PROMPT',
            prompt='Test'
        )
        question = Question.objects.create(
            quiz=quiz,
            question_text='What is 2+2?',
            question_type='SINGLE',
            order=1
        )
        answer = Answer.objects.create(
            question=question,
            answer_text='4',
            is_correct=True,
            order=1
        )
        self.assertEqual(answer.question, question)
        self.assertTrue(answer.is_correct)


class QuizAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.trainer = User.objects.create_user(
            email='trainer@test.com',
            username='trainer',
            password='testpass123',
            role='trainer'
        )
        self.student = User.objects.create_user(
            email='student@test.com',
            username='student',
            password='testpass123',
            role='student'
        )

    def test_list_quizzes(self):
        """Test listing quizzes"""
        self.client.force_authenticate(user=self.student)
        
        # Create a quiz
        quiz = Quiz.objects.create(
            title='Test Quiz',
            created_by=self.trainer,
            generation_type='PROMPT',
            prompt='Test'
        )
        
        response = self.client.get('/api/quiz/quizzes/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_start_quiz(self):
        """Test starting a quiz attempt"""
        self.client.force_authenticate(user=self.student)
        
        quiz = Quiz.objects.create(
            title='Test Quiz',
            created_by=self.trainer,
            generation_type='PROMPT',
            prompt='Test'
        )
        
        response = self.client.post(f'/api/quiz/quizzes/{quiz.id}/start/')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(QuizAttempt.objects.count(), 1)

    def test_submit_answer(self):
        """Test submitting an answer"""
        self.client.force_authenticate(user=self.student)
        
        # Create quiz structure
        quiz = Quiz.objects.create(
            title='Test Quiz',
            created_by=self.trainer,
            generation_type='PROMPT',
            prompt='Test'
        )
        question = Question.objects.create(
            quiz=quiz,
            question_text='What is 2+2?',
            question_type='SINGLE',
            order=1
        )
        answer = Answer.objects.create(
            question=question,
            answer_text='4',
            is_correct=True,
            order=1
        )
        
        # Start attempt
        attempt = QuizAttempt.objects.create(
            student=self.student,
            quiz=quiz
        )
        
        # Submit answer
        response = self.client.post(
            f'/api/quiz/attempts/{attempt.id}/answer/',
            {
                'question_id': question.id,
                'answer_ids': [answer.id]
            }
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(StudentAnswer.objects.count(), 1)

    def test_submit_quiz(self):
        """Test submitting a complete quiz"""
        self.client.force_authenticate(user=self.student)
        
        # Create quiz structure
        quiz = Quiz.objects.create(
            title='Test Quiz',
            created_by=self.trainer,
            generation_type='PROMPT',
            prompt='Test'
        )
        question = Question.objects.create(
            quiz=quiz,
            question_text='What is 2+2?',
            question_type='SINGLE',
            order=1
        )
        correct_answer = Answer.objects.create(
            question=question,
            answer_text='4',
            is_correct=True,
            order=1
        )
        
        # Start attempt and answer
        attempt = QuizAttempt.objects.create(
            student=self.student,
            quiz=quiz
        )
        student_answer = StudentAnswer.objects.create(
            attempt=attempt,
            question=question,
            is_correct=True
        )
        student_answer.selected_answers.add(correct_answer)
        
        # Submit quiz
        response = self.client.post(f'/api/quiz/attempts/{attempt.id}/submit/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        attempt.refresh_from_db()
        self.assertEqual(attempt.status, 'SUBMITTED')
        self.assertEqual(attempt.score, 100.0)
