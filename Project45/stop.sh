#!/bin/bash

echo "========================================"
echo "  Heritage Platform - Stop Services"
echo "========================================"
echo ""

echo "Stopping Docker services..."
if command -v docker &> /dev/null; then
    docker-compose down
fi

echo ""
echo "Killing backend and frontend processes..."
pkill -f uvicorn 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
pkill -f node 2>/dev/null || true

echo ""
echo "All services stopped."
echo "========================================"
