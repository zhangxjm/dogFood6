@echo off
echo ========================================
echo Quantum Key Distribution System - Docker
echo ========================================
echo.

echo [1/3] Checking Docker...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not installed or not running
    pause
    exit /b 1
)
echo OK

echo.
echo [2/3] Stopping existing containers...
docker-compose down >nul 2>&1

echo.
echo [3/3] Building and starting all services...
docker-compose up -d --build

echo.
echo ========================================
echo System Started Successfully!
echo ========================================
echo.
echo Frontend UI: http://localhost
echo Backend API: http://localhost:8080
echo.
echo To view logs: docker-compose logs -f
echo To stop: docker-compose down
echo ========================================
pause
