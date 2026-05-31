@echo off
echo ===========================================
echo Starting services with Docker...
echo ===========================================

docker-compose up -d --build

echo.
echo ===========================================
echo Services started successfully!
echo ===========================================
echo Backend API: http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo Frontend: http://localhost:8080
echo ===========================================
echo.
echo To stop services, run: docker-stop.bat
pause
