@echo off
echo ============================================
echo  Freight Dispatch System - Starting
echo ============================================
echo.

where go >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Go is not installed or not in PATH
    echo Please install Go from https://go.dev/dl/
    pause
    exit /b 1
)

echo [1/3] Downloading dependencies...
go mod tidy
if %errorlevel% neq 0 (
    echo [ERROR] Failed to download dependencies
    pause
    exit /b 1
)

echo [2/3] Building application...
go build -o freight-dispatch.exe .
if %errorlevel% neq 0 (
    echo [ERROR] Build failed
    pause
    exit /b 1
)

echo [3/3] Starting server on http://localhost:8080
echo.
echo ============================================
echo  Server is running at http://localhost:8080
echo  Press Ctrl+C to stop
echo ============================================
echo.

freight-dispatch.exe
