@echo off
echo ========================================
echo Bakery Management System Dev Start
echo ========================================
echo.

echo [1/3] Starting backend...
cd backend
start "Bakery Backend" cmd /k mvn spring-boot:run
cd ..
echo Backend starting in background...
echo.

echo [2/3] Installing frontend dependencies...
cd frontend
if not exist "node_modules" (
    call npm install
)
echo.

echo [3/3] Starting frontend...
start "Bakery Frontend" cmd /k npm run dev
cd ..
echo.

echo ========================================
echo Services Starting...
echo ========================================
echo.
echo Backend API: http://localhost:8080/api
echo Frontend URL: http://localhost:5173
echo.
echo Both services are starting in separate windows.
echo Please wait for them to fully initialize.
echo.
pause
