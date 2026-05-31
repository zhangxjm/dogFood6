@echo off
echo ========================================
echo Bakery Management System Startup Script
echo ========================================
echo.

echo [1/4] Checking Docker environment...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Docker is not installed or not running. Please install Docker Desktop first.
    pause
    exit /b 1
)
echo Docker is ready.
echo.

echo [2/4] Creating database directory...
if not exist "backend\bakery.db" (
    echo. > backend\bakery.db
)
echo.

echo [3/4] Building and starting services...
echo This may take several minutes on first run...
echo.
docker-compose up -d --build
echo.

echo [4/4] Waiting for services to be ready...
timeout /t 15 /nobreak >nul
echo.

echo ========================================
echo Startup Complete!
echo ========================================
echo.
echo Frontend URL: http://localhost
echo Backend API: http://localhost:8080/api
echo.
echo To stop services, run: docker-compose down
echo To view logs, run: docker-compose logs -f
echo.
pause
