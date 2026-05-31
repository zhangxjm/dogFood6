@echo off
chcp 65001 >nul
echo ============================================
echo   Industrial Edge Computing Platform
echo   Local Development Startup
echo ============================================
echo.

echo [1/5] Checking Go environment...
go version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Go not found. Please install Go 1.21+.
    echo Download: https://go.dev/dl/
    pause
    exit /b 1
)
echo [OK] Go is ready

echo.
echo [2/5] Checking Node.js environment...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found. Please install Node.js 18+.
    echo Download: https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js is ready

echo.
echo [3/5] Checking Redis...
redis-cli ping >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Redis not found or not running.
    echo Starting Redis with Docker...
    docker start edge-redis >nul 2>&1
    if %errorlevel% neq 0 (
        docker run -d --name edge-redis -p 6379:6379 redis:7-alpine >nul 2>&1
    )
    timeout /t 3 /nobreak >nul
)
echo [OK] Redis is ready

echo.
echo [4/5] Starting Backend...
cd /d "%~dp0\backend"
if not exist "go.sum" (
    echo Downloading Go dependencies...
    go mod tidy
)
echo Building backend...
go build -o edge-backend.exe .
if %errorlevel% neq 0 (
    echo [ERROR] Failed to build backend.
    pause
    exit /b 1
)
echo Starting backend on port 8080...
start "Edge Backend" cmd /c "edge-backend.exe"

echo.
echo [5/5] Starting Frontend...
cd /d "%~dp0\frontend"
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install --legacy-peer-deps
)
echo Starting frontend dev server on port 3000...
start "Edge Frontend" cmd /c "npm run dev"

echo.
timeout /t 5 /nobreak >nul

echo.
echo ============================================
echo   Services Started Successfully!
echo ============================================
echo.
echo   Frontend (Monitor Panel):  http://localhost:3000
echo   Backend API:               http://localhost:8080/api/health
echo   Redis:                     localhost:6379
echo.
echo   To stop: Close the backend and frontend windows
echo.
pause
