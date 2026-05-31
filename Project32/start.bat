@echo off
echo ========================================
echo Pet Behavior AI Analysis System
echo ========================================
echo.

echo [1/6] Starting Docker services...
cd /d "%~dp0docker"
docker-compose up -d
if %errorlevel% neq 0 (
    echo Failed to start Docker services. Please ensure Docker is running.
    pause
    exit /b 1
)
echo Docker services started successfully.
echo.

timeout /t 5 /nobreak >nul

echo [2/6] Installing Python dependencies...
cd /d "%~dp0backend"
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)
call venv\Scripts\activate.bat
pip install -r requirements.txt
echo Python dependencies installed.
echo.

echo [3/6] Running Django migrations...
python manage.py migrate
echo Migrations completed.
echo.

echo [4/6] Initializing default data...
python manage.py init_data
echo Data initialization completed.
echo.

echo [5/6] Installing frontend dependencies...
cd /d "%~dp0frontend"
if not exist "node_modules" (
    call npm install
)
echo Frontend dependencies installed.
echo.

echo [6/6] Starting services...
echo.
echo ========================================
echo Services are starting:
echo - MinIO: http://localhost:9001
echo - Backend API: http://localhost:8000
echo - Frontend: http://localhost:3000
echo ========================================
echo.

start "Django Backend" cmd /k "cd /d "%~dp0backend" && call venv\Scripts\activate.bat && python manage.py runserver 0.0.0.0:8000"
timeout /t 3 /nobreak >nul
start "Vue Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo All services started!
echo Press any key to exit this window (services will continue running)...
pause >nul
