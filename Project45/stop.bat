@echo off
echo ========================================
echo   Heritage Platform - Stop Services
echo ========================================
echo.

echo Stopping Docker services...
where docker >nul 2>&1
if not errorlevel 1 (
    docker-compose down
)

echo.
echo Killing backend and frontend processes...
taskkill /F /IM uvicorn.exe 2>nul
taskkill /F /IM node.exe 2>nul
taskkill /F /IM python.exe 2>nul

echo.
echo All services stopped.
echo ========================================
pause
