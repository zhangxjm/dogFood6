@echo off
chcp 65001 >nul
title Metaverse Training Platform - Docker

echo ============================================
echo   Metaverse Education Virtual Training Platform
echo   Docker Deployment
echo ============================================
echo.

echo [1/2] Building Docker images...
docker-compose build
if %errorlevel% neq 0 (
    echo Error: Failed to build Docker images.
    pause
    exit /b 1
)
echo Docker images built successfully.
echo.

echo [2/2] Starting containers...
docker-compose up -d
if %errorlevel% neq 0 (
    echo Error: Failed to start containers.
    pause
    exit /b 1
)
echo.

echo ============================================
echo   Services started successfully!
echo ============================================
echo.
echo   Server API:  http://localhost:3001/api
echo   Client UI:   http://localhost:3000
echo   WebSocket:   ws://localhost:3001/ws
echo.
echo   Demo Accounts:
echo     Admin:    admin / admin123
echo     Teacher:  teacher / teacher123
echo     Student:  student1 / student123
echo.
echo   To stop services: docker-compose down
echo ============================================
echo.

docker-compose ps

echo.
pause
