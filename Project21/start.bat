@echo off
echo ========================================
echo Heritage Immersive Learning Platform
echo ========================================
echo.

echo [1/4] Creating data directories...
if not exist "data" mkdir data
if not exist "data\minio" mkdir data\minio
if not exist "data\backend" mkdir data\backend
if not exist "backend\uploads" mkdir backend\uploads
if not exist "frontend\node_modules" mkdir frontend\node_modules
echo Directories created.
echo.

echo [2/4] Starting MinIO service...
docker-compose up -d minio
echo MinIO starting...
echo.

echo [3/4] Installing backend dependencies...
cd backend
if not exist "node_modules" (
    call npm install
)
echo Backend dependencies ready.
echo.

echo [4/4] Installing frontend dependencies...
cd ..\frontend
if not exist "node_modules" (
    call npm install
)
echo Frontend dependencies ready.
echo.

echo ========================================
echo Starting services...
echo ========================================
echo.

echo Starting backend server in new window...
start "Backend Server" cmd /k "cd /d %~dp0backend && npm run start:dev"

echo Waiting for backend to start...
timeout /t 10 /nobreak >nul

echo Starting frontend server in new window...
start "Frontend Server" cmd /k "cd /d %~dp0frontend && npm start"

echo.
echo ========================================
echo All services are starting!
echo ========================================
echo.
echo Access URLs:
echo - Frontend: http://localhost:3000
echo - Backend API: http://localhost:3001
echo - MinIO Console: http://localhost:9001 (minioadmin/minioadmin123)
echo.
echo Default accounts:
echo - Admin: admin / admin123
echo - Teacher: teacher / teacher123
echo - Student: student / student123
echo.
pause
