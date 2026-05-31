@echo off
echo ========================================
echo Satellite Orbit Simulation Platform
echo ========================================
echo.

echo [1/4] Checking Docker...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not installed or not in PATH
    echo Please install Docker Desktop first
    pause
    exit /b 1
)
echo Docker is ready
echo.

echo [2/4] Stopping any existing containers...
docker-compose -f docker/docker-compose.yml down >nul 2>&1
echo.

echo [3/4] Building and starting containers...
docker-compose -f docker/docker-compose.yml up -d --build
if %errorlevel% neq 0 (
    echo ERROR: Failed to start containers
    pause
    exit /b 1
)
echo.

echo [4/4] Waiting for services to be ready...
timeout /t 10 /nobreak >nul
echo.

echo ========================================
echo Services started successfully!
echo ========================================
echo.
echo Backend API: http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo Frontend: http://localhost:3000
echo.
echo To view logs: docker-compose -f docker/docker-compose.yml logs -f
echo To stop: docker-compose -f docker/docker-compose.yml down
echo.
pause
