@echo off
echo ========================================
echo  Aerospace Payload Test Data System
echo  Starting with Docker...
echo ========================================

echo.
echo Building and starting containers...
docker-compose up -d --build

echo.
echo Waiting for services to start...
timeout /t 15 /nobreak > nul

echo.
echo ========================================
echo  System is running!
echo  Frontend UI:  http://localhost
echo  Backend API: http://localhost:3000
echo ========================================
echo.
echo To stop: docker-compose down
echo To view logs: docker-compose logs -f
echo.
pause
