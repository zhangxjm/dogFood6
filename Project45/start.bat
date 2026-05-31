@echo off
setlocal enabledelayedexpansion

echo ========================================
echo   Heritage Digital Platform - Startup
echo ========================================
echo.

echo [1/6] Checking environment...
where python >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed. Please install Python 3.9+.
    exit /b 1
)

where node >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed. Please install Node.js 18+.
    exit /b 1
)

where docker >nul 2>&1
if errorlevel 1 (
    echo WARNING: Docker is not installed. Elasticsearch will not be available, using fallback search.
)

echo.
echo [2/6] Copying environment file...
if not exist ".env" (
    copy ".env.example" ".env" >nul
    echo Created .env file from .env.example
)

echo.
echo [3/6] Starting Docker services...
where docker >nul 2>&1
if not errorlevel 1 (
    docker ps >nul 2>&1
    if not errorlevel 1 (
        echo Starting Elasticsearch container...
        docker-compose up -d elasticsearch
        echo Waiting for Elasticsearch to be ready...
        timeout /t 20 /nobreak >nul
    ) else (
        echo WARNING: Docker is not running. Skipping Elasticsearch.
    )
)

echo.
echo [4/6] Installing backend dependencies...
cd backend
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

set VENV_PYTHON=%cd%\venv\Scripts\python.exe
set VENV_PIP=%cd%\venv\Scripts\pip.exe

echo Using Python: %VENV_PYTHON%
%VENV_PIP% install -r requirements.txt

echo.
echo [5/6] Initializing database...
%VENV_PYTHON% -c "from app.init_data import init_database; init_database()"

echo.
echo [6/6] Starting backend server...
start "Heritage Backend" cmd /k "cd /d %cd% && venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

echo.
echo Waiting for backend to start...
timeout /t 10 /nobreak >nul

echo.
echo Starting frontend...
cd ..\frontend

echo Installing frontend dependencies...
if not exist "node_modules" (
    call npm install
)

echo.
echo ========================================
echo   Starting all services...
echo ========================================
echo.
echo Backend API:    http://localhost:8000
echo API Docs:       http://localhost:8000/docs
echo Frontend:       http://localhost:3000
echo Elasticsearch:  http://localhost:9200
echo.
echo Demo Accounts:
echo   Admin:    admin / admin123
echo   Instructor: master_zhang / 123456
echo   User:     learner_wang / 123456
echo.
echo Press Ctrl+C to stop the frontend server.
echo ========================================
echo.

call npm run dev

endlocal
