@echo off
echo ========================================
echo IPR Protection System - Startup Script
echo ========================================

echo.
echo [1/5] Checking Docker...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker not found. Please install Docker first.
    pause
    exit /b 1
)
echo OK: Docker is running

echo.
echo [2/5] Starting RabbitMQ container...
docker-compose up -d rabbitmq
if %errorlevel% neq 0 (
    echo ERROR: Failed to start RabbitMQ
    pause
    exit /b 1
)
echo OK: RabbitMQ container started

echo.
echo [3/5] Waiting for RabbitMQ to be ready...
timeout /t 20 /nobreak >nul

echo.
echo [4/5] Building and starting backend...
cd backend
start cmd /k "echo Backend starting... && mvn spring-boot:run"
cd ..

echo.
echo [5/5] Starting frontend...
cd frontend
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
)
start cmd /k "echo Frontend starting... && npm run dev"
cd ..

echo.
echo ========================================
echo Startup complete!
echo ========================================
echo.
echo Backend API: http://localhost:8080
echo Frontend UI: http://localhost:3008
echo RabbitMQ Management: http://localhost:15672 (admin/admin123)
echo.
echo Please wait for services to fully start...
echo.
pause
