@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Aerospace Ground Station Platform
echo Starting Services...
echo ========================================
echo.

echo [1/5] Checking Docker...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not installed or not running
    exit /b 1
)
echo OK

echo.
echo [2/5] Starting infrastructure services (ZooKeeper, Kafka)...
docker compose up -d
if %errorlevel% neq 0 (
    echo ERROR: Failed to start infrastructure services
    exit /b 1
)

echo.
echo [3/5] Waiting for Kafka to be ready...
echo Waiting for ZooKeeper to be healthy...
:wait_zk
docker inspect gs-zookeeper --format="{{.State.Health.Status}}" 2>nul | findstr /C:"healthy" >nul
if %errorlevel% neq 0 (
    timeout /t 5 /nobreak >nul
    goto wait_zk
)
echo ZooKeeper is healthy.

echo Waiting for Kafka to be healthy...
:wait_kafka
docker inspect gs-kafka --format="{{.State.Health.Status}}" 2>nul | findstr /C:"healthy" >nul
if %errorlevel% neq 0 (
    timeout /t 5 /nobreak >nul
    goto wait_kafka
)
echo Kafka is healthy.

echo.
echo [4/5] Creating data directory...
if not exist "backend\data" (
    mkdir "backend\data"
)
echo OK

echo.
echo [5/5] Starting backend and frontend services...
echo.
echo Starting backend in a new window...
start "Ground Station Backend" cmd /k "cd /d %~dp0backend && mvn spring-boot:run"

echo.
echo Waiting for backend to start...
timeout /t 20 /nobreak >nul

echo.
echo Starting frontend in a new window...
start "Ground Station Frontend" cmd /k "cd /d %~dp0frontend && npm install && npm run dev"

echo.
echo ========================================
echo All services started successfully!
echo ========================================
echo.
echo Access URLs:
echo - Frontend Dashboard: http://localhost:3000
echo - Backend API:      http://localhost:8080
echo - Kafka UI:         http://localhost:8081
echo.
echo To stop all services, run: stop.bat
echo ========================================
pause
