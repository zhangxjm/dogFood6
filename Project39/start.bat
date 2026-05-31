@echo off
setlocal enabledelayedexpansion

echo ========================================
echo   Spa Booking System - Startup Script
echo ========================================
echo.

where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+
    exit /b 1
)

echo [INFO] Node.js version:
node --version
echo.

echo [1/5] Installing server dependencies...
cd /d "%~dp0server"
if not exist node_modules (
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Failed to install server dependencies
        exit /b 1
    )
) else (
    echo [INFO] Server dependencies already installed
)
echo.

echo [2/5] Building server...
if not exist dist (
    call npx tsc
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Failed to build server
        exit /b 1
    )
) else (
    echo [INFO] Server already built
)
echo.

echo [3/5] Installing client dependencies...
cd /d "%~dp0"
if not exist node_modules (
    call npm install --legacy-peer-deps
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Failed to install client dependencies
        exit /b 1
    )
) else (
    echo [INFO] Client dependencies already installed
)
echo.

echo [4/5] Building client for H5...
cd /d "%~dp0"
if not exist dist (
    call npx taro build --type h5
    if %ERRORLEVEL% neq 0 (
        echo [WARN] Client build failed, starting server only
    ) else (
        echo [INFO] Copying H5 build to server public directory...
        if not exist "server\public" mkdir "server\public"
        xcopy /E /Y /Q "dist" "server\public\"
    )
) else (
    echo [INFO] Client already built
)
echo.

echo [5/5] Starting server on port 3000...
cd /d "%~dp0server"
node dist/main.js

endlocal
