@echo off
chcp 65001 >nul
echo ========================================
echo   Heritage 3D Platform - Start Script
echo ========================================
echo.

echo [1/4] Checking Python environment...
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    pause
    exit /b 1
)
echo Python OK

echo.
echo [2/4] Checking Node.js environment...
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed or not in PATH
    pause
    exit /b 1
)
echo Node.js OK

echo.
echo [3/4] Starting MinIO with Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo Warning: Docker not found, skipping MinIO container
    echo Please ensure MinIO is running on port 9000
) else (
    docker ps -a --filter "name=heritage-minio" --format "{{.Names}}" | findstr /c:"heritage-minio" >nul 2>&1
    if errorlevel 1 (
        echo Creating MinIO container...
        docker run -d ^
            --name heritage-minio ^
            -p 9000:9000 ^
            -p 9001:9001 ^
            -e MINIO_ROOT_USER=minioadmin ^
            -e MINIO_ROOT_PASSWORD=minioadmin ^
            minio/minio:latest server /data --console-address ":9001"
    ) else (
        echo MinIO container exists, starting...
        docker start heritage-minio
    )
    echo Waiting for MinIO to be ready...
    timeout /t 5 /nobreak >nul
)

echo.
echo [4/4] Starting services...

echo.
echo Starting backend server...
cd backend
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
    call venv\Scripts\activate.bat
    echo Upgrading pip and setuptools...
    python -m pip install --upgrade pip setuptools wheel
    echo Installing dependencies...
    pip install -r requirements.txt
) else (
    call venv\Scripts\activate.bat
)
start "Heritage Backend" cmd /c "uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
cd ..

echo.
echo Starting frontend server...
cd frontend
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)
start "Heritage Frontend" cmd /c "npm run dev"
cd ..

echo.
echo ========================================
echo   Services Starting...
echo ========================================
echo.
echo Backend API:     http://localhost:8000
echo API Docs:        http://localhost:8000/docs
echo Frontend:        http://localhost:3000
echo MinIO Console:   http://localhost:9001
echo.
echo MinIO Credentials:
echo   Access Key: minioadmin
echo   Secret Key: minioadmin
echo.
echo Press Ctrl+C to stop all services
echo.

echo Waiting for services to be ready...
timeout /t 10 /nobreak >nul

echo.
echo Opening browser...
start http://localhost:3000

echo.
echo Services are running in background windows.
echo To stop, close the background command windows.
pause
