@echo off
echo ============================================
echo   Starting Unlock Service System
echo ============================================

cd /d "%~dp0server"

if not exist "node_modules" (
    echo Node modules not found. Please run setup.bat first.
    pause
    exit /b 1
)

if not exist "unlock_service.db" (
    echo Initializing database...
    call node init_db.js
)

echo.
echo Starting backend server on port 3000...
start "Unlock Service Backend" cmd /k "cd /d "%~dp0server" && node index.js"

timeout /t 3 /nobreak >nul

echo.
echo Starting frontend dev server on port 5173...
start "Unlock Service Frontend" cmd /k "cd /d "%~dp0client" && npm run dev"

echo.
echo ============================================
echo   System is starting up...
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:3000
echo ============================================
echo.
echo   Press any key to stop all services...
pause >nul

echo Stopping services...
taskkill /f /fi "WINDOWTITLE eq Unlock Service*" 2>nul
