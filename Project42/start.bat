@echo off
echo ========================================
echo   Self-Study Exam Platform Launcher
echo ========================================
echo.

REM Check Python
where python >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Python not found. Please install Python 3.10+
    pause
    exit /b 1
)

REM Check Node
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js not found. Please install Node.js 18+
    pause
    exit /b 1
)

echo [1/4] Installing backend dependencies...
cd backend
pip install -r requirements.txt -q
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to install Python dependencies
    pause
    exit /b 1
)

echo [2/4] Installing frontend dependencies...
cd ..
npm install --silent
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to install Node.js dependencies
    pause
    exit /b 1
)

echo [3/4] Starting backend server (FastAPI on port 8000)...
start "Backend-FastAPI" cmd /k "cd backend && python -m uvicorn main:app --host 127.0.0.1 --port 8000"

echo [4/4] Starting frontend dev server (Vite on port 5173)...
start "Frontend-Vite" cmd /k "npm run dev"

echo.
echo ========================================
echo   All services started!
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:8000
echo   API Docs: http://localhost:8000/docs
echo ========================================
echo.
echo Press any key to exit this window (servers will keep running)...
pause >nul
