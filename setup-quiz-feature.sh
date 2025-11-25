#!/bin/bash

echo "Setting up AI Quiz Feature..."

# Backend setup
echo "1. Setting up backend..."
cd backend

echo "   - Installing dependencies..."
pip install -r requirements.txt

echo "   - Running migrations..."
python manage.py migrate

echo "   - Creating superuser (if needed)..."
python manage.py createsuperuser --noinput --email admin@apranova.com || echo "Superuser already exists"

cd ..

# Frontend setup
echo "2. Setting up frontend..."
cd frontend

echo "   - Installing dependencies..."
npm install

cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Add GEMINI_API_KEY to backend/.env file"
echo "2. Start backend: cd backend && python manage.py runserver"
echo "3. Start frontend: cd frontend && npm run dev"
echo ""
echo "Access the feature:"
echo "- Trainer: http://localhost:3000/trainer/quizzes"
echo "- Student: http://localhost:3000/student/quizzes"
