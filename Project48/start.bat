@echo off
setlocal enabledelayedexpansion

echo ========================================
echo IIoT Predictive Maintenance System
echo Startup Script
echo ========================================
echo.

cd /d "%~dp0"

echo [Step 1/5] Checking environment...
where go >nul 2>&1
if errorlevel 1 (
    echo ERROR: Go is not installed or not in PATH.
    exit /b 1
)

where node >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH.
    exit /b 1
)

where npm >nul 2>&1
if errorlevel 1 (
    echo ERROR: npm is not installed or not in PATH.
    exit /b 1
)
echo Environment check passed.
echo.

echo [Step 2/5] Creating data directories...
if not exist "data" mkdir "data"
if not exist "data\influxdb" mkdir "data\influxdb"
if not exist "data\mosquitto" mkdir "data\mosquitto"
if not exist "data\mosquitto\config" mkdir "data\mosquitto\config"
if not exist "ai-service\data\models" mkdir "ai-service\data\models"
echo Data directories created.
echo.

echo [Step 3/5] Setting up backend...
cd backend
echo Downloading Go dependencies...
go mod download
if errorlevel 1 (
    echo Failed to download Go dependencies.
    exit /b 1
)
echo Building backend...
go build -o ../bin/backend.exe ./cmd
if errorlevel 1 (
    echo Failed to build backend.
    exit /b 1
)
cd ..
echo Backend setup completed.
echo.

echo [Step 4/5] Setting up frontend...
cd frontend
if not exist "node_modules" (
    echo Installing npm dependencies...
    npm install
    if errorlevel 1 (
        echo Failed to install npm dependencies.
        exit /b 1
    )
)
echo Building frontend...
npm run build
if errorlevel 1 (
    echo Failed to build frontend.
    exit /b 1
)
cd ..
echo Frontend setup completed.
echo.

echo [Step 5/5] Setting up AI service...
cd ai-service
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)
echo Activating virtual environment...
call venv\Scripts\activate
echo Installing Python dependencies...
pip install -r requirements.txt
deactivate
cd ..
echo AI service setup completed.
echo.

echo ========================================
echo Setup completed successfully!
echo ========================================
echo.
echo Starting services...
echo.

echo Starting backend service on port 8080...
start "IIoT Backend" cmd /k "cd backend && set CGO_ENABLED=0 && go run ./cmd"

timeout /t 3 /nobreak >nul

echo Starting AI prediction service on port 50051...
start "IIoT AI Service" cmd /k "cd ai-service && call venv\Scripts\activate && python main.py"

timeout /t 3 /nobreak >nul

echo Starting frontend development server on port 5173...
start "IIoT Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo All services started!
echo ========================================
echo.
echo Access URLs:
echo   - Frontend: http://localhost:5173
echo   - Backend API: http://localhost:8080
echo   - AI Service: http://localhost:50051
echo.
echo Default login: admin / admin123
echo.

endlocal
