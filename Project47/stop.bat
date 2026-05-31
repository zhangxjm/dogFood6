@echo off
echo ========================================
echo IPR Protection System - Stop Script
echo ========================================

echo.
echo Stopping RabbitMQ container...
docker-compose down

echo.
echo Stopping Java processes...
taskkill /F /IM java.exe /T 2>nul

echo.
echo Stopping Node processes...
taskkill /F /IM node.exe /T 2>nul

echo.
echo ========================================
echo All services stopped
echo ========================================
pause
