@echo off
echo ========================================
echo Starting Infrastructure Services
echo ========================================

cd docker
docker-compose up -d
cd ..

echo Waiting for services to start...
timeout /t 30 /nobreak

echo Creating Nacos namespace...
curl -X POST "http://127.0.0.1:8848/nacos/v1/console/namespaces" ^
  -d "namespace=ttc-system&namespaceName=ttc-system"

echo Infrastructure started successfully!
pause
