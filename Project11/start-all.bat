@echo off
echo ========================================
echo TTC System - Full Stack Starter
echo ========================================

echo [1/6] Initializing database...
python init-db.py

echo.
echo [2/6] Starting infrastructure...
cd docker
docker-compose up -d
cd ..

echo Waiting for infrastructure...
timeout /t 45 /nobreak

echo Creating Nacos namespace...
curl -X POST "http://127.0.0.1:8848/nacos/v1/console/namespaces" ^
  -d "namespace=ttc-system&namespaceName=ttc-system"

timeout /t 5 /nobreak

echo.
echo [3/6] Building backend services...
cd backend
start "Build Backend" cmd /c "mvn clean package -DskipTests && echo Build completed!"
cd ..

echo Please wait for build to complete, then press any key...
pause

echo.
echo [4/6] Starting backend services...
start "Gateway" cmd /k start-gateway.bat
timeout /t 5 /nobreak
start "Command Service" cmd /k start-command-service.bat
timeout /t 3 /nobreak
start "Payload Service" cmd /k start-payload-service.bat
timeout /t 3 /nobreak
start "Monitor Service" cmd /k start-monitor-service.bat
timeout /t 3 /nobreak

echo.
echo [5/6] Starting frontend...
start "Frontend" cmd /k start-frontend.bat

echo.
echo ========================================
echo All services starting!
echo Access URLs:
echo - Frontend: http://localhost:3000
echo - Gateway: http://localhost:8080
echo - Nacos: http://localhost:8848/nacos
echo - Sentinel: http://localhost:8858
echo - RocketMQ Console: http://localhost:8088
echo ========================================
pause
