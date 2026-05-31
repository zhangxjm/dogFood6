@echo off
echo ========================================
echo Nursery Management System - Startup
echo ========================================

where go >nul 2>nul
if %errorlevel% neq 0 (
    echo Go is not installed. Please install Go first.
    pause
    exit /b 1
)

echo Checking dependencies...
go mod download

echo Building application...
go build -o nursery-management.exe

echo Starting server...
echo Server will be available at http://localhost:8080
echo Press Ctrl+C to stop the server.
echo.

nursery-management.exe

pause
