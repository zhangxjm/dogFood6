@echo off
echo ========================================
echo Pet Feeder System - Startup Script
echo ========================================
echo.

echo [1/5] Checking Docker...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Docker is not installed or not running
    echo Please install Docker Desktop and start it first
    pause
    exit /b 1
)
echo Docker is ready
echo.

echo [2/5] Creating required directories...
if not exist "docker\mosquitto\config" mkdir docker\mosquitto\config
if not exist "docker\mosquitto\data" mkdir docker\mosquitto\data
if not exist "docker\mosquitto\log" mkdir docker\mosquitto\log
if not exist "docker\influxdb\data" mkdir docker\influxdb\data
if not exist "docker\influxdb\config" mkdir docker\influxdb\config
echo Directories created
echo.

echo [3/5] Starting infrastructure services...
docker-compose up -d mqtt influxdb
echo Waiting for services to initialize...
timeout /t 15 /nobreak >nul
echo Infrastructure services started
echo.

echo [4/5] Building and starting application...
docker-compose up -d --build backend frontend
echo Application services starting...
timeout /t 20 /nobreak >nul
echo.

echo [5/5] Starting device simulators...
start "Device Simulator 001" cmd /c "cd backend && python device_simulator.py device001 localhost"
timeout /t 2 /nobreak >nul
start "Device Simulator 002" cmd /c "cd backend && python device_simulator.py device002 localhost"
echo Device simulators started
echo.

echo ========================================
echo System Startup Complete!
echo ========================================
echo.
echo Access URLs:
echo - Frontend: http://localhost:3000
echo - Backend API: http://localhost:5000
echo - MQTT Broker: localhost:1883
echo - InfluxDB: http://localhost:8086
echo.
echo Services:
echo - MQTT: Running
echo - InfluxDB: Running
echo - Backend: Starting (may take a moment)
echo - Frontend: Starting (may take a moment)
echo - Device Simulators: Running
echo.
echo Press any key to open the application in browser...
pause >nul
start http://localhost:3000
echo.
echo To stop the system, run: stop.bat
echo To view logs, run: docker-compose logs -f
