@echo off
echo ========================================
echo   Farmhouse Order System - Start Script
echo ========================================
echo.

echo [1/4] Starting Docker containers...
docker compose up -d mysql

echo.
echo [2/4] Waiting for MySQL to be ready...
timeout /t 10 /nobreak > nul

echo.
echo [3/4] Downloading dependencies...
go mod download

echo.
echo [4/4] Starting application server...
go run main.go

echo.
echo Application started! Visit http://localhost:8080
echo.
pause
