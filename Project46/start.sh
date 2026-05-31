#!/bin/bash
set -e

echo "========================================"
echo "Metaverse Office System - Startup Script"
echo "========================================"
echo ""

echo "[1/3] Checking Node.js environment..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi
echo "Node.js version:"
node --version
echo ""

echo "[2/3] Installing dependencies..."
if [ ! -d "server/node_modules" ]; then
    echo "Installing server dependencies..."
    cd server && npm install && cd ..
fi
if [ ! -d "client/node_modules" ]; then
    echo "Installing client dependencies..."
    cd client && npm install && cd ..
fi
if [ ! -d "node_modules" ]; then
    echo "Installing root dependencies..."
    npm install
fi
echo "Dependencies installed."
echo ""

echo "[3/3] Starting services..."
echo "Database will be auto-initialized on first startup."
echo "Backend API: http://localhost:3000"
echo "Frontend: http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop all services."
echo ""

npm run dev
