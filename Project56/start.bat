@echo off
echo Starting Non-Heritage E-commerce System...
echo.

echo ============================================
echo Starting Backend Server on port 8000...
echo ============================================
cd backend
start "Django Backend" cmd /c "python manage.py runserver 0.0.0.0:8000"
timeout /t 3 /nobreak >nul

cd..

echo ============================================
echo Starting Frontend Server on port 3000...
echo ============================================
cd frontend
start "SolidJS Frontend" cmd /c "npm run dev"
timeout /t 5 /nobreak >nul

cd..

echo.
echo ============================================
echo System started successfully!
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo Admin:    http://localhost:8000/admin (admin/admin123)
echo API:      http://localhost:8000/api/
echo ============================================
echo.
pause
