@echo off
chcp 65001 >nul
echo ========================================
echo   Classroom Booking System
echo ========================================
echo.

where go >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Go is not installed. Please install Go first.
    pause
    exit /b 1
)

echo [INFO] Checking dependencies...
go mod tidy

echo.
echo [INFO] Building application...
go build -o classroom-booking-system.exe .

if %errorlevel% neq 0 (
    echo [ERROR] Build failed.
    pause
    exit /b 1
)

echo.
echo [INFO] Starting application...
echo [INFO] Server running at: http://localhost:8080
echo [INFO] Press Ctrl+C to stop.
echo.

classroom-booking-system.exe

pause
