@echo off
echo ========================================
echo Quantum Key Distribution System
echo ========================================
echo.

echo [1/4] Checking Docker...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not installed or not running
    echo Please start Docker Desktop first.
    pause
    exit /b 1
)
echo OK

echo.
echo [2/4] Starting Redis container...
docker ps -q -f name=qkd-redis | findstr . >nul
if %errorlevel% equ 0 (
    echo Redis container already running
) else (
    docker run -d --name qkd-redis -p 6379:6379 --restart unless-stopped redis:7-alpine redis-server --appendonly yes
    echo Waiting for Redis to start...
    timeout /t 5 /nobreak >nul
)
echo OK

echo.
echo [3/4] Building and starting backend...
cd backend
echo Downloading Go dependencies...
go mod tidy
echo Building backend...
go build -o main.exe
echo Starting backend server on port 8080...
start "QKD-Backend" cmd /k "set REDIS_ADDR=localhost:6379&& set PORT=8080&& main.exe"
cd ..
timeout /t 3 /nobreak >nul
echo OK

echo.
echo [4/4] Starting frontend...
cd frontend
if not exist "node_modules" (
    echo Installing frontend dependencies...
    npm install --registry=https://registry.npmmirror.com
)
echo Starting frontend dev server on port 3000...
start "QKD-Frontend" cmd /k "npm start"
cd ..
echo OK

echo.
echo ========================================
echo System Started Successfully!
echo ========================================
echo.
echo Backend API: http://localhost:8080
echo Frontend UI: http://localhost:3000
echo.
echo Close the popup windows to stop services
echo ========================================
pause
