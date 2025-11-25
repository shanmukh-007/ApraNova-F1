# ⚠️ IMPORTANT: Restart Backend Server

## The Issue
Getting 401 (Unauthorized) error when trying to generate quiz.

## Why?
The backend server needs to be restarted to:
1. Load the updated AI service code
2. Reload the .env file with the API key
3. Apply the new Gemini model configuration

## ✅ Solution: Restart Backend

### Step 1: Stop the Backend
In the terminal where `python manage.py runserver` is running:
- Press `Ctrl + C` to stop the server

### Step 2: Start the Backend Again
```bash
cd backend
python manage.py runserver
```

### Step 3: Test Again
1. Go to your browser
2. Navigate to `/trainer/quizzes`
3. Fill in the quiz form
4. Click "Generate Quiz"
5. Wait 10-20 seconds

## Still Getting 401?

If you still get 401 after restarting:

1. **Check if you're logged in as trainer**:
   - Logout and login again with `test78@gmail.com`
   - Or use `test2@gmail.com` (also a trainer now)

2. **Clear browser cache**:
   - Press `Ctrl + Shift + R` (hard refresh)
   - Or clear cookies and cache

3. **Check backend console**:
   - Look for any error messages
   - Should see `[DEBUG]` messages when generating quiz

---

**After restarting the backend, the quiz generation should work!** 🚀
