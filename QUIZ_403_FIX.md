# Fix 403 Error - Quiz Generation

## Problem
Getting 403 (Forbidden) error when trying to generate quizzes.

## Cause
Only users with role `trainer`, `admin`, or `superadmin` can generate quizzes. You're currently logged in as a `student`.

## ✅ Solution - 3 Options

### Option 1: Use the New Trainer Account (Easiest)

A trainer account has been created for you:

```
Email: trainer@test.com
Password: trainer123
```

**Steps:**
1. Logout from your current account
2. Login with the trainer credentials above
3. Go to `/trainer/quizzes` or click "AI Quizzes" in sidebar
4. Generate quizzes!

---

### Option 2: Convert Existing User to Trainer

If you want to use one of your existing accounts (`test2@gmail.com` or `testme@gmail.com`):

```bash
cd backend
python manage.py make_trainer test2@gmail.com
```

Or for the other account:
```bash
python manage.py make_trainer testme@gmail.com
```

Then:
1. Logout and login again (to refresh your session)
2. You should now have access to trainer features

---

### Option 3: Create New Trainer with Custom Email

```bash
cd backend
python manage.py create_trainer --email your-email@example.com --password yourpassword
```

---

## Verify Your Role

To check all users and their roles:

```bash
cd backend
python check_user_role.py
```

---

## After Fixing

1. **Logout** from your current session
2. **Login** with trainer credentials
3. **Navigate** to trainer dashboard
4. **Click** "AI Quizzes" in sidebar
5. **Generate** your first quiz!

---

## Quick Test

Once logged in as trainer, try generating a quiz:

**Title:** Python Basics Quiz
**Type:** Prompt Based
**Prompt:** Python functions, loops, and data structures
**Questions:** 5

Click "Generate Quiz" and wait 10-20 seconds.

---

## Still Getting 403?

1. Make sure you logged out and logged back in
2. Check browser console (F12) for any errors
3. Verify backend is running: `http://localhost:8000/admin`
4. Check your user role in Django admin

---

**Status**: ✅ Trainer account created and ready to use!
