@echo off
chcp 65001 >nul
title Quantum Computing Visualization System

echo ================================================
echo   Quantum Computing Visualization System
echo ================================================
echo.

REM Check Java
where java >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Java is not installed. Please install JDK 17+.
    pause
    exit /b 1
)

REM Check Maven
where mvn >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Maven is not installed. Please install Maven 3.x.
    pause
    exit /b 1
)

echo [INFO] Starting backend service...
cd /d "%~dp0backend"
start "Quantum Backend" cmd /k "mvn spring-boot:run"

echo [INFO] Waiting for backend to start...
timeout /t 15 /nobreak >nul

echo [INFO] Starting frontend service...
cd /d "%~dp0frontend"

REM Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+.
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo [INFO] Installing frontend dependencies...
    call npm install
)

start "Quantum Frontend" cmd /k "npm run dev"

echo.
echo [INFO] Services are starting...
echo [INFO] Backend API: http://localhost:8080/api
echo [INFO] Frontend UI:  http://localhost:3000
echo.
echo [INFO] Please wait for both services to fully start.
echo [INFO] Press any key to exit this window (services will continue running)...
pause >nul
