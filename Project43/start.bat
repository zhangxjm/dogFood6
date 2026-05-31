@echo off
setlocal enabledelayedexpansion

echo ========================================
echo BCI Rehabilitation System - Startup Script
echo ========================================
echo.

echo [1/4] Checking required tools...

where go >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Go is not installed. Please install Go 1.21 or higher.
    exit /b 1
)
echo - Go: OK

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed. Please install Node.js 18 or higher.
    exit /b 1
)
echo - Node.js: OK

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed.
    exit /b 1
)
echo - npm: OK

echo.
echo [2/4] Setting up backend...
cd backend

if not exist "data" (
    mkdir data
    echo - Created data directory
)

if not exist "go.sum" (
    echo - Downloading Go dependencies...
    go mod download
    if %errorlevel% neq 0 (
        echo ERROR: Failed to download Go dependencies
        exit /b 1
    )
) else (
    echo - Dependencies already downloaded
)

echo.
echo [3/4] Setting up frontend...
cd ..\frontend

if not exist "node_modules" (
    echo - Installing npm packages...
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install npm packages
        exit /b 1
    )
) else (
    echo - npm packages already installed
)

echo.
echo [4/4] Starting services...
cd ..

echo.
echo Starting backend server on port 8080...
start "BCI Backend" cmd /k "cd /d %cd%\backend && go run ./cmd/server/main.go"

timeout /t 3 /nobreak >nul

echo Starting frontend dev server on port 5173...
start "BCI Frontend" cmd /k "cd /d %cd%\frontend && npm run dev"

echo.
echo ========================================
echo Services started successfully!
echo ========================================
echo.
echo Backend API: http://localhost:8080
echo Frontend UI: http://localhost:5173
echo.
echo Default accounts:
echo   - Admin:    admin    / password123
echo   - Doctor:   doctor   / password123
echo   - Patient:  patient1 / password123
echo.
echo Press any key to close this window...
pause >nul
