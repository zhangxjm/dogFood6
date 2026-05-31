@echo off
echo Starting Energy Management System...
echo ======================================

echo [1/5] Starting Docker containers...
docker-compose up -d
if %errorlevel% neq 0 (
    echo Docker not found or failed to start. Please install Docker Desktop.
    echo Continuing without Elasticsearch...
)

echo [2/5] Waiting for services...
timeout /t 20 /nobreak >nul

echo [3/5] Starting Backend...
cd backend
start "Energy Backend" cmd /k "if exist mvnw.cmd (mvnw.cmd spring-boot:run) else (mvn spring-boot:run)"

echo [4/5] Waiting for Backend initialization...
timeout /t 60 /nobreak >nul

echo [5/5] Starting Frontend...
cd ..\frontend
if not exist node_modules (
    echo Installing frontend dependencies...
    call npm install
)
start "Energy Frontend" cmd /k "npm run dev"

echo ======================================
echo System starting up...
echo Please wait for all services to fully start.
echo.
echo Access URLs:
echo   Frontend: http://localhost:5173
echo   Backend API: http://localhost:8080/api
echo   Elasticsearch: http://localhost:9200
echo   Kibana: http://localhost:5601
echo.
echo Press any key to exit this window...
pause >nul
