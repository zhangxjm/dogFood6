@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Data Initialization Script
echo ========================================
echo.

cd /d "%~dp0.."

cd backend

echo [1/3] Creating data directories...
if not exist "..\data" mkdir "..\data"
if not exist "..\data\influxdb" mkdir "..\data\influxdb"
if not exist "..\data\mosquitto" mkdir "..\data\mosquitto"
if not exist "..\data\mosquitto\config" mkdir "..\data\mosquitto\config"
if not exist "..\ai-service\data\models" mkdir "..\ai-service\data\models"
echo Data directories created successfully.
echo.

echo [2/3] Downloading Go dependencies...
go mod download
if errorlevel 1 (
    echo Failed to download Go dependencies.
    exit /b 1
)
echo Go dependencies downloaded successfully.
echo.

echo [3/3] Running data seeder...
set CGO_ENABLED=0
go run ./cmd
if errorlevel 1 (
    echo Data seeding failed.
    exit /b 1
)
timeout /t 10 /nobreak >nul
taskkill /F /IM go.exe 2>nul
taskkill /F /IM backend.exe 2>nul
echo Data initialized successfully.
echo.

echo ========================================
echo Data initialization completed successfully!
echo ========================================
echo.
echo Default accounts:
echo   - Admin: admin / admin123
echo   - Engineer: engineer / engineer123
echo   - Manager: manager / manager123
echo.

endlocal
