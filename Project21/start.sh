#!/bin/bash

echo "========================================"
echo "Heritage Immersive Learning Platform"
echo "========================================"
echo ""

echo "[1/4] Creating data directories..."
mkdir -p data/minio
mkdir -p data/backend
mkdir -p backend/uploads
echo "Directories created."
echo ""

echo "[2/4] Starting MinIO service..."
docker-compose up -d minio
echo "MinIO starting..."
echo ""

echo "[3/4] Installing backend dependencies..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install
fi
echo "Backend dependencies ready."
echo ""

echo "[4/4] Installing frontend dependencies..."
cd ../frontend
if [ ! -d "node_modules" ]; then
    npm install
fi
echo "Frontend dependencies ready."
echo ""

echo "========================================"
echo "Starting services..."
echo "========================================"
echo ""

cd ..

# Start backend
echo "Starting backend server..."
cd backend
npm run start:dev &
BACKEND_PID=$!

# Wait for backend
echo "Waiting for backend to start..."
sleep 15

# Start frontend
echo "Starting frontend server..."
cd ../frontend
npm start &
FRONTEND_PID=$!

echo ""
echo "========================================"
echo "All services are starting!"
echo "========================================"
echo ""
echo "Access URLs:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:3001"
echo "- MinIO Console: http://localhost:9001 (minioadmin/minioadmin123)"
echo ""
echo "Default accounts:"
echo "- Admin: admin / admin123"
echo "- Teacher: teacher / teacher123"
echo "- Student: student / student123"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user to stop
trap "kill $BACKEND_PID $FRONTEND_PID; docker-compose stop; exit" SIGINT SIGTERM
wait
