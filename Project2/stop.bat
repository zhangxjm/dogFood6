@echo off
echo Stopping Grain Oil Inventory System...
echo.

echo Stopping Docker containers...
docker-compose down

echo.
echo All services stopped.
pause
