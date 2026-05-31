@echo off
chcp 65001 >nul
title Metaverse Training Platform

echo ============================================
echo   Metaverse Education Virtual Training Platform
echo ============================================
echo.

echo [1/4] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed. Please install Node.js 18+ first.
    echo Download: https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js version: %node -v%
echo OK
echo.

echo [2/4] Installing server dependencies...
cd server
call npm install --production
if %errorlevel% neq 0 (
    echo Error: Failed to install server dependencies.
    pause
    exit /b 1
)
cd ..
echo Server dependencies installed.
echo.

echo [3/4] Installing client dependencies...
cd client
call npm install
if %errorlevel% neq 0 (
    echo Error: Failed to install client dependencies.
    pause
    exit /b 1
)
echo Client dependencies installed.
echo.

echo [4/4] Building client application...
call npm run build
if %errorlevel% neq 0 (
    echo Error: Failed to build client application.
    pause
    exit /b 1
)
cd ..
echo Client build complete.
echo.

echo ============================================
echo   Starting services...
echo ============================================
echo.

start "Metaverse Training Server" cmd /k "cd server && node app.js"

timeout /t 3 /nobreak >nul

start "Metaverse Training Client" cmd /k "cd client && npm start"

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
echo   Press Ctrl+C to stop all services.
echo ============================================
echo.

pause
