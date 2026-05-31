@echo off
echo Starting Silver Care Booking System in Development Mode...
echo.

echo Starting Backend on port 8080...
start "Backend" cmd /c "mvn spring-boot:run"

echo Waiting for backend to start...
timeout /t 10 /nobreak

echo Starting Frontend on port 3000...
cd frontend
start "Frontend" cmd /c "npm run dev"
cd ..

echo.
echo ========================================
echo Development servers started!
echo Backend:  http://localhost:8080
echo Frontend: http://localhost:3000
echo ========================================
echo.
echo Test Accounts:
echo Admin: admin / admin123
echo Staff: staff / staff123
echo User:  user / user123
echo.
pause
