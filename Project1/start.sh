#!/bin/bash

echo "============================================"
echo "  Starting Unlock Service System"
echo "============================================"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR/server"

if [ ! -d "node_modules" ]; then
    echo "Node modules not found. Please run ./setup.sh first."
    exit 1
fi

if [ ! -f "unlock_service.db" ]; then
    echo "Initializing database..."
    node init_db.js
fi

echo ""
echo "Starting backend server on port 3000..."
cd "$SCRIPT_DIR/server"
node index.js &
BACKEND_PID=$!

sleep 3

echo ""
echo "Starting frontend dev server on port 5173..."
cd "$SCRIPT_DIR/client"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "============================================"
echo "  System is starting up..."
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:3000"
echo "============================================"
echo ""
echo "  Press Ctrl+C to stop all services..."

trap "echo 'Stopping services...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM

wait
