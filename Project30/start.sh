#!/bin/bash

echo "Starting Warehouse Management System..."

echo "[1/5] Starting Redis container..."
docker-compose up -d redis
sleep 5

echo "[2/5] Installing Go dependencies..."
cd backend
go mod download
cd ..

echo "[3/5] Installing Node.js dependencies..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
fi
cd ..

echo "[4/5] Starting Go backend server..."
cd backend
go run cmd/main.go &
BACKEND_PID=$!
cd ..

sleep 3

echo "[5/5] Starting Next.js frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "========================================"
echo "System is starting up..."
echo "Backend API: http://localhost:8082"
echo "Frontend UI: http://localhost:3000"
echo "Redis: localhost:6379"
echo "========================================"
echo ""
echo "Press Ctrl+C to stop all services"

trap "kill $BACKEND_PID $FRONTEND_PID; docker-compose down; exit" INT
wait
