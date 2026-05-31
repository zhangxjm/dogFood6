#!/bin/bash

echo "========================================"
echo "Satellite Orbit Simulation Platform"
echo "========================================"
echo ""

echo "[1/4] Checking Docker..."
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker is not installed or not in PATH"
    echo "Please install Docker first"
    exit 1
fi
echo "Docker is ready"
echo ""

echo "[2/4] Stopping any existing containers..."
docker-compose -f docker/docker-compose.yml down > /dev/null 2>&1
echo ""

echo "[3/4] Building and starting containers..."
docker-compose -f docker/docker-compose.yml up -d --build
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to start containers"
    exit 1
fi
echo ""

echo "[4/4] Waiting for services to be ready..."
sleep 10
echo ""

echo "========================================"
echo "Services started successfully!"
echo "========================================"
echo ""
echo "Backend API: http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
echo "Frontend: http://localhost:3000"
echo ""
echo "To view logs: docker-compose -f docker/docker-compose.yml logs -f"
echo "To stop: docker-compose -f docker/docker-compose.yml down"
