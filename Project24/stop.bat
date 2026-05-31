@echo off
echo ========================================
echo Pet Feeder System - Stop Script
echo ========================================
echo.

echo Stopping device simulators...
taskkill /f /im python.exe 2>nul
echo Device simulators stopped
echo.

echo Stopping Docker containers...
docker-compose down
echo All services stopped
echo.

echo ========================================
echo System stopped successfully
echo ========================================
pause
