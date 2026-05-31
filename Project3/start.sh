#!/bin/bash
echo "========================================"
echo "Starting Photo Reservation System"
echo "========================================"

echo "[0/5] Cleaning old data..."
cd docker
if [ -d "mysql" ]; then
    docker-compose down -v
    rm -rf mysql
fi
cd ..

echo "[1/5] Starting MySQL container..."
cd docker
docker-compose up -d
cd ..

echo "[2/5] Waiting for MySQL to initialize..."
sleep 30

echo "[3/5] Building and starting backend..."
cd backend
mvn clean spring-boot:run &
BACKEND_PID=$!
cd ..

echo "[4/5] Starting frontend..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi
npm run dev &
FRONTEND_PID=$!
cd ..

echo "[5/5] Done!"
echo "========================================"
echo "System startup initiated!"
echo "Backend API: http://localhost:8080/api"
echo "Frontend: http://localhost:3000"
echo "========================================"
echo "Press Ctrl+C to stop all services"

trap "kill $BACKEND_PID $FRONTEND_PID; cd docker && docker-compose down; exit" INT
wait
