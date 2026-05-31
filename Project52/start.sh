#!/bin/bash

echo "========================================"
echo "  Aerospace Payload Test Data System"
echo "  Starting..."
echo "========================================"

echo ""
echo "[1/3] Installing server dependencies..."
cd server
if [ ! -d "node_modules" ]; then
    npm install
fi

echo ""
echo "[2/3] Installing client dependencies..."
cd ../client
if [ ! -d "node_modules" ]; then
    npm install
fi
if [ ! -d "dist" ]; then
    echo "Building client..."
    npm run build
fi

echo ""
echo "[3/3] Starting servers..."
cd ..

echo ""
echo "Starting backend server (port 3000)..."
cd server && npm start &
SERVER_PID=$!

echo "Waiting for backend to start..."
sleep 5

echo ""
echo "Starting frontend server (port 8080)..."
cd ../client && npx serve -s dist -p 8080 &
CLIENT_PID=$!

echo ""
echo "========================================"
echo "  System is starting!"
echo "  Backend API: http://localhost:3000"
echo "  Frontend UI:  http://localhost:8080"
echo "========================================"
echo ""
echo "Press Ctrl+C to stop all services"

trap "kill $SERVER_PID $CLIENT_PID; exit" INT
wait
