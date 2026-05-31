@echo off
echo ========================================
echo Cross-border Cultural and Creative Goods
echo Customs Declaration System
echo ========================================
echo.

echo [1/4] Checking Node.js and npm installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed. Please install Node.js 18+ first.
    echo Download: https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js version:
node --version
npm --version

echo.
echo [2/4] Initializing backend dependencies...
cd backend
if not exist "node_modules" (
    echo Installing backend dependencies...
    call npm install
) else (
    echo Backend dependencies already installed.
)

echo.
echo [3/4] Initializing database...
if not exist "data\customs.db" (
    echo Creating and initializing database...
    call npm run init-db
) else (
    echo Database already exists.
)

echo.
echo [4/4] Starting backend server...
start "Customs Backend" cmd /k "npm start"

echo.
echo Backend server starting on http://localhost:3000
echo Health check: http://localhost:3000/api/health
echo.

echo Starting frontend in new terminal...
cd ..\frontend
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
)
start "Customs Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo System is starting up...
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:3000/api
echo ========================================
echo.
echo Press any key to exit this window (services will continue running)...
pause >nul
