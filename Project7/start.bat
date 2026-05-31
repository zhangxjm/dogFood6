@echo off
echo ========================================
echo Utility Billing Management System
echo ========================================
echo.
echo Starting services...
echo.

docker-compose down
docker-compose build
docker-compose up -d

echo.
echo Waiting for services to be ready...
timeout /t 15 /nobreak >nul

echo.
echo ========================================
echo Services started successfully!
echo ========================================
echo.
echo Backend API:  http://localhost:8000
echo API Docs:     http://localhost:8000/docs
echo Frontend:     http://localhost:3000
echo.
echo To stop services, run: stop.bat
echo To view logs, run: docker-compose logs -f
echo.
pause
