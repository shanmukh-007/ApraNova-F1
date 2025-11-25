# AI Quiz Feature - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### 1. Get Google Gemini API Key
1. Visit https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key

### 2. Configure Backend
Add to `backend/.env`:
```env
GEMINI_API_KEY=your-api-key-here
```

### 3. Run Setup Script
**Windows:**
```powershell
.\setup-quiz-feature.ps1
```

**Mac/Linux:**
```bash
chmod +x setup-quiz-feature.sh
./setup-quiz-feature.sh
```

### 4. Start Services
**Terminal 1 - Backend:**
```bash
cd backend
python manage.py runserver
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## 📝 Usage

### For Trainers
1. Go to: http://localhost:3000/trainer/quizzes
2. Fill in the form:
   - **Title**: "Python Basics Quiz"
   - **Type**: Choose "Topic/Prompt Based"
   - **Prompt**: "Python functions, loops, and data structures"
   - **Questions**: 5
3. Click "Generate Quiz"
4. Wait 10-20 seconds for AI to generate
5. Quiz appears in the list!

### For Students
1. Go to: http://localhost:3000/student/quizzes
2. Browse available quizzes
3. Click "Start Quiz"
4. Answer questions:
   - Click radio buttons for single choice
   - Click checkboxes for multiple choice
   - Use Next/Previous to navigate
5. Click "Submit Quiz"
6. View your score and answers!

## 🎯 Example Prompts

### Good Prompts:
- "JavaScript ES6 features including arrow functions, promises, and async/await"
- "Python data structures: lists, dictionaries, sets, and tuples"
- "React hooks: useState, useEffect, and custom hooks"
- "SQL basics: SELECT, JOIN, WHERE, and GROUP BY"
- "Git commands for version control"

### Web Search Examples:
- "Latest features in Python 3.12"
- "React 19 new features"
- "TypeScript best practices 2024"

## 🔧 Troubleshooting

### "GEMINI_API_KEY not configured"
- Make sure you added the key to `backend/.env`
- Restart the backend server

### "Failed to generate quiz"
- Check your internet connection
- Verify API key is valid
- Try a simpler prompt

### Quiz not appearing
- Refresh the page
- Check browser console for errors
- Verify backend is running

## 📊 Features

✅ AI-powered question generation  
✅ Single and multiple-choice questions  
✅ Auto-save answers  
✅ Progress tracking  
✅ Instant scoring  
✅ Detailed answer review  
✅ Quiz management for trainers  

## 🎓 Tips

1. **Be Specific**: More detailed prompts = better questions
2. **Set Context**: Include difficulty level in prompt
3. **Review First**: Preview questions before sharing
4. **Start Small**: Begin with 5 questions, increase later
5. **Test It**: Take your own quiz to verify quality

## 📚 API Endpoints

### Generate Quiz
```bash
POST /api/quiz/quizzes/generate/
{
  "title": "Quiz Title",
  "prompt": "Your topic here",
  "generation_type": "PROMPT",
  "num_questions": 5
}
```

### List Quizzes
```bash
GET /api/quiz/quizzes/
```

### Start Quiz
```bash
POST /api/quiz/quizzes/{id}/start/
```

### Submit Answer
```bash
POST /api/quiz/attempts/{id}/answer/
{
  "question_id": 1,
  "answer_ids": [1]
}
```

### Submit Quiz
```bash
POST /api/quiz/attempts/{id}/submit/
```

## 🐛 Testing

Run backend tests:
```bash
cd backend
python manage.py test quizzes
```

## 📞 Support

For issues or questions:
1. Check `AI_QUIZ_FEATURE.md` for detailed docs
2. Review error messages in browser console
3. Check backend logs for API errors

---

**Happy Quiz Creating! 🎉**
