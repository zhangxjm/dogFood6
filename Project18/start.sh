#!/bin/bash

echo "============================================"
echo "  Industrial Edge Computing Platform"
echo "  Startup Script"
echo "============================================"
echo ""

echo "[1/4] Checking Docker environment..."
if ! command -v docker &> /dev/null; then
    echo "[ERROR] Docker not found. Please install Docker first."
    exit 1
fi
echo "[OK] Docker is ready"

echo ""
echo "[2/4] Checking docker-compose..."
if ! docker compose version &> /dev/null; then
    echo "[ERROR] docker compose not found."
    exit 1
fi
echo "[OK] docker compose is ready"

echo ""
echo "[3/4] Building and starting services..."
cd "$(dirname "$0")"
docker compose up -d --build

if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to start services."
    exit 1
fi

echo ""
echo "[4/4] Waiting for services to be ready..."
sleep 10

echo ""
echo "============================================"
echo "  Services Started Successfully!"
echo "============================================"
echo ""
echo "  Frontend (Monitor Panel):  http://localhost:3000"
echo "  Backend API:               http://localhost:8080/api/health"
echo "  Redis:                     localhost:6379"
echo ""
echo "  To stop services:  docker compose down"
echo "  To view logs:      docker compose logs -f"
echo ""
