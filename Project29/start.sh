#!/bin/bash

echo "========================================"
echo "Heritage NFT Platform - Startup Script"
echo "========================================"

echo "[1/5] Creating data directories..."
mkdir -p backend/data

echo "[2/5] Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "Error: Backend npm install failed"
    exit 1
fi

echo "[3/5] Building backend..."
npx nest build
if [ $? -ne 0 ]; then
    echo "Error: Backend build failed"
    exit 1
fi

echo "[4/5] Installing frontend dependencies..."
cd ../frontend
npm install
if [ $? -ne 0 ]; then
    echo "Error: Frontend npm install failed"
    exit 1
fi

echo "[5/5] Starting services..."
cd ../backend
DB_PATH=./data/heritage.db JWT_SECRET=heritage-nft-secret-key-2024 ES_NODE=http://localhost:9200 node dist/main.js &
BACKEND_PID=$!

cd ../frontend
npx vite --host --port 8080 &
FRONTEND_PID=$!

echo "========================================"
echo "Services started successfully!"
echo "Backend API: http://localhost:3000"
echo "Frontend: http://localhost:8080"
echo "========================================"

wait
