@echo off
echo ========================================
echo Cross-Border Logistics System
echo ========================================
echo.

echo [1/5] Starting RabbitMQ container...
docker-compose up -d rabbitmq
if %errorlevel% neq 0 (
    echo Failed to start RabbitMQ
    exit /b 1
)

echo Waiting for RabbitMQ to be ready...
timeout /t 15 /nobreak >nul

echo.
echo [2/5] Initializing Go backend dependencies...
cd backend
go mod tidy
if %errorlevel% neq 0 (
    echo Failed to download Go dependencies
    exit /b 1
)

echo.
echo [3/5] Starting Go backend server...
start "Backend Server" cmd /k "go run main.go"
cd ..

echo Waiting for backend to start...
timeout /t 10 /nobreak >nul

echo.
echo [4/5] Initializing Vue frontend dependencies...
cd frontend
if not exist node_modules (
    call npm install
    if %errorlevel% neq 0 (
        echo Failed to install frontend dependencies
        exit /b 1
    )
)

echo.
echo [5/5] Starting Vue frontend server...
start "Frontend Server" cmd /k "npm run dev"
cd ..

echo.
echo ========================================
echo System Startup Complete!
echo ========================================
echo Backend API: http://localhost:8080
echo Frontend UI: http://localhost:3000
echo RabbitMQ Management: http://localhost:15672 (guest/guest)
echo.
echo Press any key to exit...
pause >nul
