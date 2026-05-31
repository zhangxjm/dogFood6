@echo off
echo Stopping NFT Audit System...

echo Stopping Redis...
docker-compose down

echo Stopping backend and frontend processes...
taskkill /F /IM go.exe /T >nul 2>&1
taskkill /F /IM node.exe /T >nul 2>&1

echo All services stopped.
pause
