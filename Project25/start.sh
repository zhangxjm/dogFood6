#!/bin/bash

echo "============================================"
echo "  Metaverse Education Virtual Training Platform"
echo "============================================"
echo ""

echo "[1/4] Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js 18+ first."
    echo "Download: https://nodejs.org/"
    exit 1
fi
echo "Node.js version: $(node -v)"
echo "OK"
echo ""

echo "[2/4] Installing server dependencies..."
cd server
npm install --production
if [ $? -ne 0 ]; then
    echo "Error: Failed to install server dependencies."
    exit 1
fi
cd ..
echo "Server dependencies installed."
echo ""

echo "[3/4] Installing client dependencies..."
cd client
npm install
if [ $? -ne 0 ]; then
    echo "Error: Failed to install client dependencies."
    exit 1
fi
echo "Client dependencies installed."
echo ""

echo "[4/4] Building client application..."
npm run build
if [ $? -ne 0 ]; then
    echo "Error: Failed to build client application."
    exit 1
fi
cd ..
echo "Client build complete."
echo ""

echo "============================================"
echo "  Starting services..."
echo "============================================"
echo ""

cd server
node app.js &
SERVER_PID=$!

sleep 3

cd ../client
npm start &
CLIENT_PID=$!

echo ""
echo "============================================"
echo "  Services started successfully!"
echo "============================================"
echo ""
echo "  Server API:  http://localhost:3001/api"
echo "  Client UI:   http://localhost:3000"
echo "  WebSocket:   ws://localhost:3001/ws"
echo ""
echo "  Demo Accounts:"
echo "    Admin:    admin / admin123"
echo "    Teacher:  teacher / teacher123"
echo "    Student:  student1 / student123"
echo ""
echo "  Press Ctrl+C to stop all services."
echo "============================================"
echo ""

trap "echo 'Stopping services...'; kill $SERVER_PID $CLIENT_PID 2>/dev/null; exit 0" INT TERM

wait
