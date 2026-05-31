@echo off
echo ========================================
echo Stopping QKD System
echo ========================================
echo.

echo Stopping Redis container...
docker stop qkd-redis >nul 2>&1
docker rm qkd-redis >nul 2>&1
echo OK

echo Stopping backend processes...
taskkill /F /IM main.exe >nul 2>&1
echo OK

echo Stopping frontend processes...
taskkill /F /IM node.exe >nul 2>&1
echo OK

echo.
echo ========================================
echo All services stopped
echo ========================================
pause
