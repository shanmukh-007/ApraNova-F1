Write-Host "Setting up AI Quiz Feature..." -ForegroundColor Green

# Backend setup
Write-Host "`n1. Setting up backend..." -ForegroundColor Cyan
Set-Location backend

Write-Host "   - Installing dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt

Write-Host "   - Running migrations..." -ForegroundColor Yellow
python manage.py migrate

Set-Location ..

# Frontend setup
Write-Host "`n2. Setting up frontend..." -ForegroundColor Cyan
Set-Location frontend

Write-Host "   - Installing dependencies..." -ForegroundColor Yellow
npm install

Set-Location ..

Write-Host "`n✅ Setup complete!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Add GEMINI_API_KEY to backend/.env file"
Write-Host "2. Start backend: cd backend; python manage.py runserver"
Write-Host "3. Start frontend: cd frontend; npm run dev"
Write-Host "`nAccess the feature:" -ForegroundColor Yellow
Write-Host "- Trainer: http://localhost:3000/trainer/quizzes"
Write-Host "- Student: http://localhost:3000/student/quizzes"
