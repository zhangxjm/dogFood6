@echo off
echo ========================================
echo Appliance Rental System
echo ========================================
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed. Please install Node.js first.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js found!
echo.

echo Installing dependencies...
if not exist "node_modules" (
    call npm install
    if %errorlevel% neq 0 (
        echo Error: Failed to install dependencies.
        pause
        exit /b 1
    )
)

echo.
echo Initializing database...
if not exist "database\appliance_rental.db" (
    call node database/init.js
)

echo.
echo Starting server...
echo.
echo Server will be available at: http://localhost:3000
echo Press Ctrl+C to stop the server.
echo ========================================
echo.

call npm start

pause
