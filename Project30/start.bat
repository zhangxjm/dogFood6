@echo off
echo Starting Warehouse Management System...

echo [1/5] Starting Redis container...
docker-compose up -d redis
timeout /t 5 /nobreak > nul

echo [2/5] Installing Go dependencies...
cd backend
go mod download
cd ..

echo [3/5] Installing Node.js dependencies...
cd frontend
if not exist "node_modules" (
    call npm install
)
cd ..

echo [4/5] Starting Go backend server...
start "Warehouse Backend" cmd /k "cd backend && go run cmd/main.go"

echo [5/5] Starting Next.js frontend...
timeout /t 3 /nobreak > nul
start "Warehouse Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo System is starting up...
echo Backend API: http://localhost:8082
echo Frontend UI: http://localhost:3000
echo Redis: localhost:6379
echo ========================================
echo.
echo Press any key to exit this window...
echo (The servers will continue running)
pause > nul
