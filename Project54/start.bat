@echo off
echo ===========================================
echo Resume Template Management System
echo ===========================================
echo.

echo [INFO] Checking Python environment...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH
    exit /b 1
)

echo [INFO] Checking Node.js environment...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    exit /b 1
)

echo.
echo [1/6] Generating preview images...
cd backend
python generate_previews.py
if %errorlevel% neq 0 (
    echo [ERROR] Failed to generate preview images
    exit /b 1
)

echo.
echo [2/6] Initializing database and data...
python init_data.py
if %errorlevel% neq 0 (
    echo [ERROR] Failed to initialize data
    exit /b 1
)

echo.
echo [3/6] Installing backend dependencies...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install backend dependencies
    exit /b 1
)

echo.
echo [4/6] Installing frontend dependencies...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install frontend dependencies
    exit /b 1
)

echo.
echo [5/6] Building frontend...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Failed to build frontend
    exit /b 1
)

echo.
echo [6/6] Starting services...
cd ..

echo [INFO] Starting backend server on port 8000...
start "Backend Server" cmd /k "cd backend && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 3 /nobreak >nul

echo [INFO] Starting frontend server on port 5173...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo ===========================================
echo Services started successfully!
echo ===========================================
echo Backend API: http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo Frontend: http://localhost:5173
echo ===========================================
echo.
pause
