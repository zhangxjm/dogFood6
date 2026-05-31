@echo off
echo ========================================
echo Pet Medical Imaging AI Diagnosis System
echo ========================================
echo.
echo [1] Initialize Backend
echo [2] Initialize Frontend
echo [3] Start Backend
echo [4] Start Frontend
echo [5] Start All
echo [6] Exit
echo.
set /p choice="Please select an option: "

if "%choice%"=="1" (
    call scripts\init_backend.bat
) else if "%choice%"=="2" (
    call scripts\init_frontend.bat
) else if "%choice%"=="3" (
    start "Backend" cmd /k scripts\start_backend.bat
) else if "%choice%"=="4" (
    start "Frontend" cmd /k scripts\start_frontend.bat
) else if "%choice%"=="5" (
    echo Starting backend...
    start "Backend" cmd /k scripts\start_backend.bat
    timeout /t 5 /nobreak >nul
    echo Starting frontend...
    start "Frontend" cmd /k scripts\start_frontend.bat
    echo.
    echo System starting...
    echo Backend: http://localhost:8000
    echo Frontend: http://localhost:3000
    echo.
    echo Default accounts:
    echo   Admin: admin / admin123
    echo   Doctor: doctor / doctor123
    echo   Assistant: assistant / assistant123
) else if "%choice%"=="6" (
    exit
) else (
    echo Invalid option!
    pause
)
