#!/bin/bash

set -e

echo "========================================"
echo "BCI Rehabilitation System - Startup Script"
echo "========================================"
echo ""

echo "[1/4] Checking required tools..."

if ! command -v go &> /dev/null; then
    echo "ERROR: Go is not installed. Please install Go 1.21 or higher."
    exit 1
fi
echo "- Go: OK"

if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi
echo "- Node.js: OK"

if ! command -v npm &> /dev/null; then
    echo "ERROR: npm is not installed."
    exit 1
fi
echo "- npm: OK"

echo ""
echo "[2/4] Setting up backend..."
cd backend

mkdir -p data

if [ ! -f "go.sum" ]; then
    echo "- Downloading Go dependencies..."
    go mod download
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to download Go dependencies"
        exit 1
    fi
else
    echo "- Dependencies already downloaded"
fi

cd ..

echo ""
echo "[3/4] Setting up frontend..."
cd frontend

if [ ! -d "node_modules" ]; then
    echo "- Installing npm packages..."
    npm install
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to install npm packages"
        exit 1
    fi
else
    echo "- npm packages already installed"
fi

cd ..

echo ""
echo "[4/4] Starting services..."
echo ""

echo "Starting backend server on port 8080..."
cd backend
go run ./cmd/server/main.go &
BACKEND_PID=$!
cd ..

sleep 3

echo "Starting frontend dev server on port 5173..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "========================================"
echo "Services started successfully!"
echo "========================================"
echo ""
echo "Backend API: http://localhost:8080"
echo "Frontend UI: http://localhost:5173"
echo ""
echo "Default accounts:"
echo "  - Admin:    admin    / password123"
echo "  - Doctor:   doctor   / password123"
echo "  - Patient:  patient1 / password123"
echo ""
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "Press Ctrl+C to stop all services"

cleanup() {
    echo ""
    echo "Stopping services..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    wait $BACKEND_PID 2>/dev/null || true
    wait $FRONTEND_PID 2>/dev/null || true
    echo "Services stopped."
    exit 0
}

trap cleanup SIGINT SIGTERM

wait
