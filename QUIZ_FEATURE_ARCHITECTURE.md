# AI Quiz Feature - Architecture Overview

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Trainer Interface              Student Interface            │
│  ┌──────────────────┐          ┌──────────────────┐        │
│  │ Quiz Generator   │          │ Quiz List        │        │
│  │ - Form Input     │          │ - Browse Quizzes │        │
│  │ - AI Generation  │          │ - Start Quiz     │        │
│  │ - Quiz List      │          └──────────────────┘        │
│  └──────────────────┘                                        │
│                                  ┌──────────────────┐        │
│                                  │ Quiz Taking      │        │
│                                  │ - Questions      │        │
│                                  │ - Navigation     │        │
│                                  │ - Progress       │        │
│                                  └──────────────────┘        │
│                                                               │
│                                  ┌──────────────────┐        │
│                                  │ Results          │        │
│                                  │ - Score          │        │
│                                  │ - Review         │        │
│                                  └──────────────────┘        │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ REST API (JWT Auth)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Django REST)                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  API Endpoints                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ /api/quiz/quizzes/                                    │  │
│  │ - generate/ (POST)  - Generate quiz with AI          │  │
│  │ - list (GET)        - List all quizzes               │  │
│  │ - detail (GET)      - Get quiz with questions        │  │
│  │ - delete (DELETE)   - Remove quiz                    │  │
│  │ - {id}/start/ (POST) - Start quiz attempt            │  │
│  │                                                        │  │
│  │ /api/quiz/attempts/                                   │  │
│  │ - {id}/answer/ (POST)  - Submit answer               │  │
│  │ - {id}/submit/ (POST)  - Submit entire quiz          │  │
│  │ - {id}/ (GET)          - Get attempt details         │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                 │
│                            ▼                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              AI Service (ai_service.py)               │  │
│  │  - generate_quiz_from_prompt()                        │  │
│  │  - generate_quiz_from_web_search()                    │  │
│  │  - _call_gemini_api()                                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                 │
└────────────────────────────┼─────────────────────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Google Gemini  │
                    │      API        │
                    └─────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database (PostgreSQL)                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐             │
│  │   Quiz   │───▶│ Question │───▶│  Answer  │             │
│  └──────────┘    └──────────┘    └──────────┘             │
│       │                                  ▲                   │
│       │                                  │                   │
│       ▼                                  │                   │
│  ┌──────────┐    ┌──────────────┐      │                   │
│  │QuizAttempt│───▶│StudentAnswer │──────┘                   │
│  └──────────┘    └──────────────┘                           │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Data Flow

### Quiz Generation Flow
```
1. Trainer fills form
   ↓
2. Frontend sends POST /api/quiz/quizzes/generate/
   ↓
3. Backend validates request
   ↓
4. AI Service calls Google Gemini API
   ↓
5. Gemini returns JSON with questions
   ↓
6. Backend creates Quiz, Questions, Answers in DB
   ↓
7. Frontend receives complete quiz data
   ↓
8. Quiz appears in trainer's list
```

### Quiz Taking Flow
```
1. Student clicks "Start Quiz"
   ↓
2. Frontend sends POST /api/quiz/quizzes/{id}/start/
   ↓
3. Backend creates QuizAttempt
   ↓
4. Frontend loads quiz questions
   ↓
5. Student answers questions
   ↓
6. Each answer auto-saved via POST /api/quiz/attempts/{id}/answer/
   ↓
7. Student clicks "Submit"
   ↓
8. Backend calculates score
   ↓
9. Frontend shows results page
```

## 🗄️ Database Schema

```sql
-- Quiz Table
CREATE TABLE quiz (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200),
    description TEXT,
    created_by_id INTEGER REFERENCES custom_user(id),
    generation_type VARCHAR(20),  -- 'PROMPT' or 'WEB_SEARCH'
    prompt TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Question Table
CREATE TABLE question (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER REFERENCES quiz(id),
    question_text TEXT,
    question_type VARCHAR(20),  -- 'SINGLE' or 'MULTIPLE'
    order INTEGER,
    created_at TIMESTAMP
);

-- Answer Table
CREATE TABLE answer (
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES question(id),
    answer_text TEXT,
    is_correct BOOLEAN DEFAULT FALSE,
    order INTEGER
);

-- QuizAttempt Table
CREATE TABLE quiz_attempt (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES custom_user(id),
    quiz_id INTEGER REFERENCES quiz(id),
    status VARCHAR(20),  -- 'IN_PROGRESS' or 'SUBMITTED'
    score FLOAT,
    started_at TIMESTAMP,
    submitted_at TIMESTAMP
);

-- StudentAnswer Table
CREATE TABLE student_answer (
    id SERIAL PRIMARY KEY,
    attempt_id INTEGER REFERENCES quiz_attempt(id),
    question_id INTEGER REFERENCES question(id),
    is_correct BOOLEAN,
    answered_at TIMESTAMP
);

-- StudentAnswer_SelectedAnswers (Many-to-Many)
CREATE TABLE student_answer_selected_answers (
    student_answer_id INTEGER REFERENCES student_answer(id),
    answer_id INTEGER REFERENCES answer(id),
    PRIMARY KEY (student_answer_id, answer_id)
);
```

## 🔐 Authentication & Authorization

```
┌─────────────────────────────────────────────┐
│         JWT Authentication Flow              │
├─────────────────────────────────────────────┤
│                                              │
│  1. User logs in                            │
│  2. Backend issues JWT token                │
│  3. Frontend stores token                   │
│  4. All API requests include:               │
│     Authorization: Bearer <token>           │
│  5. Backend validates token                 │
│  6. Backend checks user role                │
│  7. Request processed or rejected           │
│                                              │
└─────────────────────────────────────────────┘

Role-Based Access:
┌──────────┬─────────────┬─────────────┐
│   Role   │   Trainer   │   Student   │
├──────────┼─────────────┼─────────────┤
│ Generate │     ✅      │     ❌      │
│ Delete   │     ✅      │     ❌      │
│ View All │     ✅      │     ✅      │
│ Take     │     ✅      │     ✅      │
│ Results  │     ✅      │     ✅      │
└──────────┴─────────────┴─────────────┘
```

## 🎨 Component Hierarchy

```
Frontend Component Tree:

TrainerQuizzesPage
├── QuizGenerator
│   ├── Form
│   │   ├── Input (title)
│   │   ├── RadioGroup (generation_type)
│   │   ├── Textarea (prompt)
│   │   ├── Input (num_questions)
│   │   └── Button (submit)
│   └── Toast (notifications)
└── QuizList
    └── Card[] (quiz items)
        ├── CardHeader
        ├── CardContent
        └── Button (delete)

StudentQuizzesPage
└── QuizList
    └── Card[] (quiz items)
        ├── CardHeader
        ├── CardContent
        └── Button (start)

QuizAttemptPage
└── QuizTaking
    ├── Card (question)
    │   ├── Progress
    │   ├── Question Text
    │   ├── RadioGroup | Checkbox[]
    │   └── Navigation Buttons
    └── Card (progress grid)
        └── Button[] (question numbers)

QuizResultsPage
└── Card (results)
    ├── Score Display
    └── Card[] (question review)
        ├── Question Text
        ├── Answer Options
        └── Correct/Incorrect Indicators
```

## 🔄 State Management

```
Frontend State:

Quiz Generator:
- formData: { title, prompt, generation_type, num_questions }
- loading: boolean

Quiz List:
- quizzes: Quiz[]
- loading: boolean

Quiz Taking:
- attempt: QuizAttempt
- quiz: QuizDetail
- currentQuestionIndex: number
- answers: Record<questionId, answerId[]>
- loading: boolean
- submitting: boolean

Quiz Results:
- attempt: QuizAttempt
- quiz: QuizDetail
- loading: boolean
```

## 🚀 API Request/Response Examples

### Generate Quiz
```json
POST /api/quiz/quizzes/generate/

Request:
{
  "title": "Python Basics",
  "prompt": "Python functions and loops",
  "generation_type": "PROMPT",
  "num_questions": 5
}

Response:
{
  "id": 1,
  "title": "Python Basics",
  "questions": [
    {
      "id": 1,
      "question_text": "What is a function?",
      "question_type": "SINGLE",
      "answers": [
        {"id": 1, "answer_text": "A reusable block of code", "is_correct": true},
        {"id": 2, "answer_text": "A variable", "is_correct": false}
      ]
    }
  ]
}
```

### Submit Answer
```json
POST /api/quiz/attempts/1/answer/

Request:
{
  "question_id": 1,
  "answer_ids": [1]
}

Response:
{
  "id": 1,
  "question": 1,
  "is_correct": true,
  "answered_at": "2024-01-01T12:00:00Z"
}
```

## 📈 Performance Metrics

- Quiz Generation: 10-20 seconds (AI processing)
- Quiz Loading: < 1 second
- Answer Submission: < 500ms
- Quiz Submission: < 1 second
- Results Loading: < 1 second

## 🔧 Technology Stack Summary

**Backend:**
- Django 5.2.7
- Django REST Framework 3.16.1
- PostgreSQL
- Google Gemini API

**Frontend:**
- Next.js 15
- React 19
- TypeScript 5.9
- Tailwind CSS 4.1
- Radix UI
- Axios

**Infrastructure:**
- JWT Authentication
- CORS enabled
- RESTful API design
- Responsive UI

---

This architecture provides a scalable, maintainable foundation for the AI Quiz feature with clear separation of concerns and modern best practices.
