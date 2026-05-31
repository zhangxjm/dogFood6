#!/bin/bash

set -e

echo "========================================"
echo "Aerospace Ground Station Platform"
echo "Starting Services..."
echo "========================================"
echo ""

echo "[1/5] Checking Docker..."
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker is not installed or not running"
    exit 1
fi
echo "OK"

echo ""
echo "[2/5] Starting infrastructure services (ZooKeeper, Kafka)..."
docker compose up -d

echo ""
echo "[3/5] Waiting for services to be healthy..."
echo -n "Waiting for ZooKeeper"
until docker inspect gs-zookeeper --format='{{.State.Health.Status}}' 2>/dev/null | grep -q healthy; do
    echo -n "."
    sleep 3
done
echo " OK"

echo -n "Waiting for Kafka"
until docker inspect gs-kafka --format='{{.State.Health.Status}}' 2>/dev/null | grep -q healthy; do
    echo -n "."
    sleep 5
done
echo " OK"

echo ""
echo "[4/5] Creating data directory..."
mkdir -p backend/data
echo "OK"

echo ""
echo "[5/5] Starting backend and frontend services..."
echo ""
echo "Starting backend..."
cd backend
mvn spring-boot:run &
BACKEND_PID=$!

echo "Waiting for backend to start..."
sleep 20

echo ""
echo "Starting frontend..."
cd ../frontend
npm install
npm run dev &
FRONTEND_PID=$!

echo ""
echo "========================================"
echo "All services started successfully!"
echo "========================================"
echo ""
echo "Access URLs:"
echo "- Frontend Dashboard: http://localhost:3000"
echo "- Backend API:      http://localhost:8080"
echo "- Kafka UI:         http://localhost:8081"
echo ""
echo "Process IDs:"
echo "- Backend:  $BACKEND_PID"
echo "- Frontend: $FRONTEND_PID"
echo ""
echo "To stop services, run: ./stop.sh"
echo "========================================"

wait
