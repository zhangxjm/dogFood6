#!/bin/bash
echo "========================================"
echo "NFT Audit Compliance System - Startup"
echo "========================================"

echo "[1/6] Cleaning old database..."
if [ -f "backend/nft_audit.db" ]; then
    rm -f "backend/nft_audit.db"
    echo "Old database removed."
fi

echo "[2/6] Starting Redis service..."
docker-compose up -d redis

echo "Waiting for Redis to be ready..."
while ! docker exec nft-audit-redis redis-cli ping > /dev/null 2>&1; do
    sleep 1
done
echo "Redis is ready."

echo "[3/6] Initializing Go backend dependencies..."
cd backend
if [ ! -f "go.sum" ]; then
    go mod tidy
fi

echo "[4/6] Starting Go backend server..."
if command -v gnome-terminal &> /dev/null; then
    gnome-terminal --title="NFT Audit Backend" -- go run main.go &
elif command -v xterm &> /dev/null; then
    xterm -T "NFT Audit Backend" -e "go run main.go" &
else
    go run main.go &
fi
BACKEND_PID=$!
cd ..
sleep 5

echo "[5/6] Installing frontend dependencies..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
fi

echo "[6/6] Starting Next.js frontend..."
if command -v gnome-terminal &> /dev/null; then
    gnome-terminal --title="NFT Audit Frontend" -- npm run dev &
elif command -v xterm &> /dev/null; then
    xterm -T "NFT Audit Frontend" -e "npm run dev" &
else
    npm run dev &
fi
FRONTEND_PID=$!
cd ..

echo "========================================"
echo "System starting..."
echo "Backend: http://localhost:8080 (PID: $BACKEND_PID)"
echo "Frontend: http://localhost:3000 (PID: $FRONTEND_PID)"
echo "========================================"
echo "Press Ctrl+C to stop services"

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; docker-compose down; exit" SIGINT
wait
