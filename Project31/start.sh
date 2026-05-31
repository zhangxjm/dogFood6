#!/bin/bash

echo "========================================"
echo "  Digital Twin System Startup Script"
echo "========================================"
echo ""

echo "[1/5] Checking Docker..."
if ! command -v docker &> /dev/null; then
    echo "Error: Docker not found. Please install Docker first."
    exit 1
fi

echo "[2/5] Creating data directories..."
mkdir -p data/rocketmq/broker/logs
mkdir -p data/rocketmq/broker/store

echo "[3/5] Building backend..."
cd backend
mvn clean package -DskipTests -q
if [ $? -ne 0 ]; then
    echo "Error: Backend build failed."
    cd ..
    exit 1
fi
cd ..

echo "[4/5] Starting services with Docker Compose..."
docker-compose up -d --build

echo "[5/5] Waiting for services to be ready..."
sleep 30

echo ""
echo "========================================"
echo "  Startup Complete!"
echo "========================================"
echo ""
echo "  Frontend: http://localhost:5173"
echo "  Backend API: http://localhost:8080"
echo ""
echo "  Use ./stop.sh to stop services"
echo "  Use ./logs.sh to view logs"
echo ""
