@echo off
echo ========================================
echo NFT Audit Compliance System - Startup
echo ========================================

echo [1/6] Cleaning old database...
if exist "backend\nft_audit.db" (
    del "backend\nft_audit.db"
    echo Old database removed.
)

echo [2/6] Starting Redis service...
docker-compose up -d redis

echo Waiting for Redis to be ready...
:wait_redis
timeout /t 2 /nobreak >nul
docker exec nft-audit-redis redis-cli ping >nul 2>&1
if errorlevel 1 goto wait_redis
echo Redis is ready.

echo [3/6] Initializing Go backend dependencies...
cd backend
if not exist "go.sum" (
    go mod tidy
)

echo [4/6] Starting Go backend server...
start "NFT Audit Backend" cmd /k "go run main.go"
cd ..

timeout /t 5 /nobreak >nul

echo [5/6] Installing frontend dependencies...
cd frontend
if not exist "node_modules" (
    call npm install
)

echo [6/6] Starting Next.js frontend...
start "NFT Audit Frontend" cmd /k "npm run dev"
cd ..

echo ========================================
echo System starting...
echo Backend: http://localhost:8080
echo Frontend: http://localhost:3000
echo ========================================
echo Press any key to exit...
pause >nul
