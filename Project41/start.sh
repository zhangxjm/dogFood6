#!/bin/bash

echo "========================================"
echo "Bakery Management System Startup Script"
echo "========================================"
echo ""

echo "[1/4] Checking Docker environment..."
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed or not running. Please install Docker first."
    exit 1
fi
echo "Docker is ready."
echo ""

echo "[2/4] Creating database file..."
if [ ! -f "backend/bakery.db" ]; then
    touch backend/bakery.db
fi
echo ""

echo "[3/4] Building and starting services..."
echo "This may take several minutes on first run..."
echo ""
docker-compose up -d --build
echo ""

echo "[4/4] Waiting for services to be ready..."
sleep 15
echo ""

echo "========================================"
echo "Startup Complete!"
echo "========================================"
echo ""
echo "Frontend URL: http://localhost"
echo "Backend API: http://localhost:8080/api"
echo ""
echo "To stop services, run: docker-compose down"
echo "To view logs, run: docker-compose logs -f"
echo ""
