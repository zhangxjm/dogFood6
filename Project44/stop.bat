@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Aerospace Ground Station Platform
echo Stopping Services...
echo ========================================
echo.

echo [1/3] Stopping frontend and backend processes...
taskkill /FI "WINDOWTITLE eq Ground Station Frontend*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Ground Station Backend*" /F >nul 2>&1
echo OK

echo.
echo [2/3] Stopping Docker containers...
docker compose down
if %errorlevel% neq 0 (
    echo WARNING: Some containers may not have stopped properly
)

echo.
echo [3/3] Cleaning up...
echo OK

echo.
echo ========================================
echo All services stopped successfully
echo ========================================
pause
