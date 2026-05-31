@echo off
chcp 65001 >nul
echo ========================================
echo   Cross-border Payment Risk Control System
echo   Starting Services...
echo ========================================
echo.

echo [1/4] Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js is ready

echo.
echo [2/4] Installing dependencies...
if not exist "node_modules" (
    echo Installing server dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo Error: Failed to install server dependencies
        pause
        exit /b 1
    )
) else (
    echo Server dependencies already installed
)

if not exist "client\node_modules" (
    echo Installing client dependencies...
    cd client
    call npm install
    if %errorlevel% neq 0 (
        echo Error: Failed to install client dependencies
        cd ..
        pause
        exit /b 1
    )
    cd ..
) else (
    echo Client dependencies already installed
)

echo.
echo [3/4] Initializing database...
call npm run init
if %errorlevel% neq 0 (
    echo Warning: Database initialization may have issues, but continuing...
)

echo.
echo [4/4] Building frontend...
cd client
call npm run build
if %errorlevel% neq 0 (
    echo Warning: Frontend build failed, but server will still start
    cd ..
) else (
    cd ..
)

echo.
echo ========================================
echo   Services Starting...
echo   Server: http://localhost:3034
echo   Default Account: admin / admin123
echo ========================================
echo.

call npm start

pause
