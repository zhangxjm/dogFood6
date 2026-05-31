#!/bin/bash

echo "============================================"
echo "  Metaverse Virtual Exhibition System"
echo "============================================"

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

echo "[1/5] Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed"
    exit 1
fi
NODE_VERSION=$(node --version)
echo "Node.js version: $NODE_VERSION"

echo ""
echo "[2/5] Installing server dependencies..."
cd "$PROJECT_DIR/server"
if [ ! -d "node_modules" ]; then
    npm install
    if [ $? -ne 0 ]; then
        echo "Error: Failed to install server dependencies"
        exit 1
    fi
fi

echo ""
echo "[3/5] Installing client dependencies..."
cd "$PROJECT_DIR/client"
if [ ! -d "node_modules" ]; then
    npm install
    if [ $? -ne 0 ]; then
        echo "Error: Failed to install client dependencies"
        exit 1
    fi
fi

echo ""
echo "[4/5] Building server..."
cd "$PROJECT_DIR/server"
npm run build
if [ $? -ne 0 ]; then
    echo "Error: Failed to build server"
    exit 1
fi

echo ""
echo "[5/5] Building client..."
cd "$PROJECT_DIR/client"
npm run build
if [ $? -ne 0 ]; then
    echo "Error: Failed to build client"
    exit 1
fi

echo ""
echo "============================================"
echo "  Starting Services..."
echo "============================================"

echo ""
echo "Starting server on port 3001..."
cd "$PROJECT_DIR/server"
npm run start:prod &
SERVER_PID=$!

sleep 3

echo "Starting client on port 3000..."
cd "$PROJECT_DIR/client"
npm run start &
CLIENT_PID=$!

echo ""
echo "============================================"
echo "  Services Started Successfully!"
echo "============================================"
echo ""
echo "  Client: http://localhost:3000"
echo "  Server: http://localhost:3001"
echo ""
echo "  Demo accounts:"
echo "    - demo_user_01"
echo "    - demo_user_02"
echo "    - demo_user_03"
echo ""
echo "  Press Ctrl+C to stop all services"
echo "============================================"

trap "echo 'Stopping services...'; kill $SERVER_PID $CLIENT_PID 2>/dev/null; exit 0" INT TERM

wait
