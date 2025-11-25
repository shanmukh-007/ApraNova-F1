# AI-Generated Quiz Feature

## Overview
This feature enables trainers to create quizzes dynamically using AI (Google Gemini), and allows students to take these quizzes interactively.

## Features

### For Trainers
- **AI Quiz Generation**: Create quizzes using two modes:
  - **Prompt-Based**: Generate questions from a topic or prompt
  - **Web Search-Based**: Generate questions from web search content
- **Quiz Management**: View, manage, and delete created quizzes
- **Customizable**: Choose number of questions (1-20)

### For Students
- **Browse Quizzes**: View all available quizzes
- **Interactive Quiz Taking**: 
  - Single and multiple-choice questions
  - Progress tracking with visual indicators
  - Auto-save answers
  - Navigate between questions
- **Instant Results**: View score and detailed answer review after submission

## Setup Instructions

### Backend Setup

1. **Install Dependencies**
```bash
cd backend
pip install -r requirements.txt
```

2. **Get Google Gemini API Key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Add to your `.env` file:
```env
GEMINI_API_KEY=your-gemini-api-key-here
```

3. **Run Migrations**
```bash
python manage.py migrate
```

4. **Start Backend Server**
```bash
python manage.py runserver
```

### Frontend Setup

1. **Install Dependencies**
```bash
cd frontend
npm install
```

2. **Start Development Server**
```bash
npm run dev
```

## API Endpoints

### Quiz Management
- `POST /api/quiz/quizzes/generate/` - Generate new quiz using AI
- `GET /api/quiz/quizzes/` - List all quizzes
- `GET /api/quiz/quizzes/{id}/` - Get quiz details
- `DELETE /api/quiz/quizzes/{id}/` - Delete quiz

### Quiz Taking
- `POST /api/quiz/quizzes/{id}/start/` - Start quiz attempt
- `POST /api/quiz/attempts/{id}/answer/` - Submit answer
- `POST /api/quiz/attempts/{id}/submit/` - Submit entire quiz
- `GET /api/quiz/attempts/{id}/` - Get attempt details
- `GET /api/quiz/attempts/` - List user's attempts

## Usage

### Trainer Workflow
1. Navigate to `/trainer/quizzes`
2. Fill in the quiz generation form:
   - Enter quiz title
   - Choose generation type (Prompt or Web Search)
   - Enter topic/prompt or search query
   - Select number of questions
3. Click "Generate Quiz"
4. View generated quiz in the list
5. Delete quizzes as needed

### Student Workflow
1. Navigate to `/student/quizzes`
2. Browse available quizzes
3. Click "Start Quiz" on desired quiz
4. Answer questions:
   - Use radio buttons for single-choice
   - Use checkboxes for multiple-choice
   - Navigate with Previous/Next buttons
   - Track progress with visual indicators
5. Click "Submit Quiz" when done
6. View results with score and answer review

## Database Models

### Quiz
- Stores quiz metadata
- Links to creator (trainer)
- Tracks generation type and prompt

### Question
- Individual questions in a quiz
- Supports single and multiple-choice types
- Ordered within quiz

### Answer
- Answer options for questions
- Marks correct answers
- Ordered within question

### QuizAttempt
- Tracks student's quiz attempt
- Stores score and submission status
- Links student to quiz

### StudentAnswer
- Individual student answers
- Tracks correctness
- Links to attempt and question

## Technology Stack

### Backend
- Django 5.2.7
- Django REST Framework
- Google Gemini API (via REST API)
- PostgreSQL

### Frontend
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Radix UI components
- Axios for API calls

## Future Enhancements
- Timed quizzes with countdown
- Question difficulty levels
- Quiz categories and tags
- Detailed analytics for trainers
- Student performance tracking
- Quiz sharing and duplication
- Export quiz results to PDF
- Integration with Google Custom Search API for better web search
- Support for more question types (true/false, fill-in-blank)
- Quiz templates and question banks
