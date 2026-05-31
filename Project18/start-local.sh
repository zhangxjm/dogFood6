#!/bin/bash

echo "============================================"
echo "  Industrial Edge Computing Platform"
echo "  Local Development Startup"
echo "============================================"
echo ""

echo "[1/5] Checking Go environment..."
if ! command -v go &> /dev/null; then
    echo "[ERROR] Go not found. Please install Go 1.21+."
    echo "Download: https://go.dev/dl/"
    exit 1
fi
echo "[OK] Go is ready"

echo ""
echo "[2/5] Checking Node.js environment..."
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js not found. Please install Node.js 18+."
    echo "Download: https://nodejs.org/"
    exit 1
fi
echo "[OK] Node.js is ready"

echo ""
echo "[3/5] Checking Redis..."
if ! redis-cli ping &> /dev/null; then
    echo "[WARNING] Redis not found or not running."
    echo "Starting Redis with Docker..."
    docker start edge-redis &> /dev/null || \
    docker run -d --name edge-redis -p 6379:6379 redis:7-alpine &> /dev/null
    sleep 3
fi
echo "[OK] Redis is ready"

echo ""
echo "[4/5] Starting Backend..."
cd "$(dirname "$0")/backend"
if [ ! -f "go.sum" ]; then
    echo "Downloading Go dependencies..."
    go mod tidy
fi
echo "Building backend..."
go build -o edge-backend .
if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to build backend."
    exit 1
fi
echo "Starting backend on port 8080..."
./edge-backend &
BACKEND_PID=$!

echo ""
echo "[5/5] Starting Frontend..."
cd "$(dirname "$0")/frontend"
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install --legacy-peer-deps
fi
echo "Starting frontend dev server on port 3000..."
npm run dev &
FRONTEND_PID=$!

sleep 5

echo ""
echo "============================================"
echo "  Services Started Successfully!"
echo "============================================"
echo ""
echo "  Frontend (Monitor Panel):  http://localhost:3000"
echo "  Backend API:               http://localhost:8080/api/health"
echo "  Redis:                     localhost:6379"
echo ""
echo "  To stop: kill $BACKEND_PID $FRONTEND_PID"
echo ""

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
