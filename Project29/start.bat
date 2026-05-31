@echo off
echo ========================================
echo Heritage NFT Platform - Startup Script
echo ========================================

echo [1/5] Creating data directories...
if not exist "backend\data" mkdir backend\data

echo [2/5] Installing backend dependencies...
cd backend
call npm install
if errorlevel 1 (
    echo Error: Backend npm install failed
    pause
    exit /b 1
)

echo [3/5] Building backend...
call npx nest build
if errorlevel 1 (
    echo Error: Backend build failed
    pause
    exit /b 1
)

echo [4/5] Installing frontend dependencies...
cd ..\frontend
call npm install
if errorlevel 1 (
    echo Error: Frontend npm install failed
    pause
    exit /b 1
)

echo [5/5] Starting services...
cd ..\backend
start "Backend" cmd /c "set DB_PATH=./data/heritage.db&& set JWT_SECRET=heritage-nft-secret-key-2024&& set ES_HOST=http://localhost:9200&& node dist/main.js"
cd ..\frontend
start "Frontend" cmd /c "npx vite --host --port 8080"

timeout /t 5 /nobreak >nul
echo ========================================
echo Services started successfully!
echo Backend API: http://localhost:3000
echo Frontend: http://localhost:8080
echo ========================================
