@echo off
chcp 65001 >nul
echo ========================================
echo   Digital Twin System Startup Script
echo ========================================
echo.

echo [1/5] Checking Docker...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Docker not found. Please install Docker first.
    pause
    exit /b 1
)

echo [2/5] Creating data directories...
if not exist "data" mkdir data
if not exist "data\rocketmq" mkdir data\rocketmq
if not exist "data\rocketmq\broker" mkdir data\rocketmq\broker
if not exist "data\rocketmq\broker\logs" mkdir data\rocketmq\broker\logs
if not exist "data\rocketmq\broker\store" mkdir data\rocketmq\broker\store

echo [3/5] Building backend...
cd backend
call mvn clean package -DskipTests -q
if %errorlevel% neq 0 (
    echo Error: Backend build failed.
    cd ..
    pause
    exit /b 1
)
cd ..

echo [4/5] Starting services with Docker Compose...
docker-compose up -d --build

echo [5/5] Waiting for services to be ready...
timeout /t 30 /nobreak >nul

echo.
echo ========================================
echo   Startup Complete!
echo ========================================
echo.
echo   Frontend: http://localhost:5173
echo   Backend API: http://localhost:8080
echo   RocketMQ Console: http://localhost:8180
echo.
echo   Press any key to view logs, or Ctrl+C to exit...
pause >nul

echo.
echo Displaying service logs...
docker-compose logs -f
