@echo off
chcp 65001 >nul
echo ============================================
echo   Stopping All Services...
echo ============================================
echo.

echo Stopping Docker containers...
docker-compose down 2>nul

echo.
echo Stopping Java processes...
taskkill /F /IM java.exe 2>nul

echo.
echo Stopping Node processes...
taskkill /F /IM node.exe 2>nul

echo.
echo All services stopped.
pause
