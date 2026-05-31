@echo off
chcp 65001 >nul
echo ============================================
echo   Silver Hair Health Monitoring Platform
echo   Starting Services...
echo ============================================
echo.

echo [1/3] Checking Docker...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Warning: Docker not found, skipping MQTT broker
    goto skip-docker
)

echo Starting MQTT Broker...
docker-compose up -d mqtt-broker
echo MQTT Broker started on port 1883
:skip-docker

echo.
echo [2/3] Starting Backend Service...
cd backend
start "ElderCare Backend" cmd /k "mvn spring-boot:run"
echo Backend service is starting on port 8080...
timeout /t 5 /nobreak >nul

echo.
echo [3/3] Starting Frontend Service...
cd ..\frontend
if not exist node_modules (
    echo Installing frontend dependencies...
    call npm install
)
start "ElderCare Frontend" cmd /k "npm run dev"
echo Frontend service is starting on port 3000...

echo.
echo ============================================
echo   All services started successfully!
echo ============================================
echo.
echo Backend API:  http://localhost:8080
echo Frontend UI:  http://localhost:3000
echo Swagger UI:   http://localhost:8080/swagger-ui.html
echo.
echo Press any key to exit this window...
pause >nul
