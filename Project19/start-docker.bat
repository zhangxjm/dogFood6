@echo off
chcp 65001 >nul
title Quantum System - Docker

echo ================================================
echo   Quantum Computing System - Docker Mode
echo ================================================
echo.

REM Check Docker
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not installed or not running.
    pause
    exit /b 1
)

echo [INFO] Starting services with Docker Compose...
cd /d "%~dp0"

REM Build and start
docker-compose up --build -d

echo.
echo [INFO] Services are starting...
echo [INFO] Backend API: http://localhost:8080/api
echo [INFO] Frontend UI:  http://localhost:3000
echo.
echo [INFO] To view logs: docker-compose logs -f
echo [INFO] To stop services: docker-compose down
echo.
pause
