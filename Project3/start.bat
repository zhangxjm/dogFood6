@echo off
echo ========================================
echo Starting Photo Reservation System
echo ========================================

echo [0/5] Cleaning old data...
cd docker
if exist mysql (
    docker-compose down -v
    rmdir /s /q mysql
)
cd ..

echo [1/5] Starting MySQL container...
cd docker
docker-compose up -d
cd ..

echo [2/5] Waiting for MySQL to initialize...
timeout /t 30 /nobreak

echo [3/5] Building and starting backend...
cd backend
start "Backend Server" cmd /k "mvn clean spring-boot:run"
cd ..

echo [4/5] Starting frontend...
cd frontend
if not exist node_modules (
    echo Installing frontend dependencies...
    call npm install
)
start "Frontend Server" cmd /k "npm run dev"
cd ..

echo [5/5] Done!
echo ========================================
echo System startup initiated!
echo Backend API: http://localhost:8080/api
echo Frontend: http://localhost:3000
echo ========================================
pause
