@echo off
chcp 65001 >nul
echo ============================================
echo   Industrial Edge Computing Platform
echo   Startup Script
echo ============================================
echo.

echo [1/4] Checking Docker environment...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker not found. Please install Docker first.
    pause
    exit /b 1
)
echo [OK] Docker is ready

echo.
echo [2/4] Checking docker-compose...
docker compose version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] docker compose not found.
    pause
    exit /b 1
)
echo [OK] docker compose is ready

echo.
echo [3/4] Building and starting services...
cd /d "%~dp0"
docker compose up -d --build

if %errorlevel% neq 0 (
    echo [ERROR] Failed to start services.
    pause
    exit /b 1
)

echo.
echo [4/4] Waiting for services to be ready...
timeout /t 10 /nobreak >nul

echo.
echo ============================================
echo   Services Started Successfully!
echo ============================================
echo.
echo   Frontend (Monitor Panel):  http://localhost:3000
echo   Backend API:               http://localhost:8080/api/health
echo   Redis:                     localhost:6379
echo.
echo   To stop services:  docker compose down
echo   To view logs:      docker compose logs -f
echo.
pause
