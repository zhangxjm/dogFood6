@echo off
chcp 65001 >nul
echo ========================================
echo Remote Sensing Platform - Local Mode
echo ========================================
echo.

echo [1/7] Checking Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python not found! Please install Python 3.8+
    pause
    exit /b 1
)
python --version

echo.
echo [2/7] Creating directories...
if not exist "backend\uploads" mkdir backend\uploads
if not exist "backend\thumbnails" mkdir backend\thumbnails
if not exist "backend\change_masks" mkdir backend\change_masks

echo.
echo [3/7] Installing backend dependencies...
cd backend
pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
cd ..

echo.
echo [4/7] Initializing database...
cd backend
python init_data.py
cd ..

echo.
echo [5/7] Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not found! Please install Node.js 16+
    pause
    exit /b 1
)
node --version

echo.
echo [6/7] Installing frontend dependencies...
cd frontend
npm config set registry https://registry.npmmirror.com
npm install
cd ..

echo.
echo [7/7] Starting services...
echo.
echo Backend will run on: http://localhost:8000
echo Frontend will run on: http://localhost:5173
echo.
echo ========================================
echo Press any key to start backend first...
pause >nul

start "Backend" cmd /k "cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

echo Waiting for backend to start...
timeout /t 10 /nobreak >nul

start "Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo Services starting...
echo Backend: http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo Frontend: http://localhost:5173
echo ========================================
echo.
pause
