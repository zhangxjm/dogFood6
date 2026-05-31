@echo off
chcp 65001 >nul
echo ============================================
echo    Error Notebook System - Local Start
echo ============================================
echo.

echo [1/3] Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js not found. Please install Node.js first.
    echo Download: https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js is ready.

echo.
echo [2/3] Installing dependencies...
cd backend
if not exist node_modules (
    call npm install --registry=https://registry.npmmirror.com
)
if not exist database.json (
    echo Initializing database...
    node init-data.js
)
cd ..

echo.
echo [3/3] Starting server...
cd backend
echo.
echo ============================================
echo    System Started Successfully!
echo ============================================
echo.
echo Frontend URL: http://localhost:8000
echo.
echo To stop the server, press Ctrl+C
echo ============================================
echo.

start http://localhost:8000

node server.js

pause
