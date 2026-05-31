#!/bin/bash

set -e

echo "========================================"
echo "Aerospace Ground Station Platform"
echo "Stopping Services..."
echo "========================================"
echo ""

echo "[1/3] Stopping frontend and backend processes..."
pkill -f "spring-boot:run" || true
pkill -f "vite" || true
pkill -f "npm run dev" || true
echo "OK"

echo ""
echo "[2/3] Stopping Docker containers..."
docker compose down
echo "OK"

echo ""
echo "[3/3] Cleaning up..."
echo "OK"

echo ""
echo "========================================"
echo "All services stopped successfully"
echo "========================================"
