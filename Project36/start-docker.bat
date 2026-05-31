@echo off
echo ========================================
echo Nursery Management System - Docker Startup
echo ========================================

where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo Docker is not installed. Please install Docker first.
    pause
    exit /b 1
)

echo Starting services with Docker Compose...
docker-compose up -d --build

echo.
echo Services started successfully!
echo Server will be available at http://localhost:8080
echo.
echo To view logs: docker-compose logs -f
echo To stop: docker-compose down
echo.

pause
