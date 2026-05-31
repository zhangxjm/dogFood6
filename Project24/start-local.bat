@echo off
echo ========================================
echo Pet Feeder System - Local Dev Startup
echo ========================================
echo.

echo [1/4] Creating virtual environment...
if not exist "venv" (
    python -m venv venv
)
call venv\Scripts\activate
echo Virtual environment ready
echo.

echo [2/4] Installing backend dependencies...
cd backend
pip install -r requirements.txt
cd ..
echo Dependencies installed
echo.

echo [3/4] Installing frontend dependencies...
cd frontend
call npm install
echo Building frontend...
call npm run build
cd ..
echo Frontend ready
echo.

echo [4/4] Starting services...
echo Starting backend server...
start "Backend Server" cmd /c "call venv\Scripts\activate && cd backend && python app.py"
echo Waiting for backend to start...
timeout /t 10 /nobreak >nul

echo Starting device simulators...
start "Device Simulator 001" cmd /c "call venv\Scripts\activate && cd backend && python device_simulator.py device001 localhost"
timeout /t 2 /nobreak >nul
start "Device Simulator 002" cmd /c "call venv\Scripts\activate && cd backend && python device_simulator.py device002 localhost"
echo.

echo ========================================
echo System Startup Complete!
echo ========================================
echo.
echo Access URLs:
echo - Frontend: http://localhost:5000
echo - Backend API: http://localhost:5000
echo.
echo Services:
echo - Backend: Running
echo - Device Simulators: Running
echo.
echo Press any key to open the application in browser...
pause >nul
start http://localhost:5000
