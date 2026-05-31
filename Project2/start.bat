@echo off
echo ========================================
echo Grain Oil Inventory System
echo ========================================
echo.

echo [1/4] Starting MySQL container...
docker-compose up -d mysql
if %ERRORLEVEL% neq 0 (
    echo Failed to start MySQL container
    pause
    exit /b 1
)

echo.
echo [2/4] Waiting for MySQL to be ready...
:waitmysql
docker exec grain_oil_mysql mysqladmin ping -h localhost -uroot -p123456 --silent 2>nul
if %ERRORLEVEL% neq 0 (
    timeout /t 3 /nobreak >nul
    goto waitmysql
)
echo MySQL is ready!

echo.
echo [3/4] Downloading Go dependencies...
cd backend
go mod tidy
if %ERRORLEVEL% neq 0 (
    echo Failed to download dependencies
    pause
    exit /b 1
)

echo.
echo [4/4] Starting backend server...
echo Server will run on http://localhost:8080
echo Press Ctrl+C to stop the server
echo.
go run main.go
