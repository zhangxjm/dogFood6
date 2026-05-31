@echo off
echo ========================================
echo Metaverse Office System - Startup Script
echo ========================================
echo.

echo [1/3] Checking Node.js environment...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)
echo Node.js version:
node --version
echo.

echo [2/3] Installing dependencies...
if not exist "server\node_modules" (
    echo Installing server dependencies...
    cd server && npm install && cd ..
)
if not exist "client\node_modules" (
    echo Installing client dependencies...
    cd client && npm install && cd ..
)
if not exist "node_modules" (
    echo Installing root dependencies...
    npm install
)
echo Dependencies installed.
echo.

echo [3/3] Starting services...
echo Database will be auto-initialized on first startup.
echo Backend API: http://localhost:3000
echo Frontend: http://localhost:3001
echo.
echo Press Ctrl+C to stop all services.
echo.

npm run dev
