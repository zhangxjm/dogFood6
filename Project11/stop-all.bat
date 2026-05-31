@echo off
echo ========================================
echo Stopping All Services
echo ========================================

echo Stopping docker containers...
cd docker
docker-compose down
cd ..

echo Stopping Java processes...
taskkill /F /IM java.exe 2>nul

echo Stopping node processes...
taskkill /F /IM node.exe 2>nul

echo All services stopped!
pause
