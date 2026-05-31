#!/bin/bash

echo "========================================"
echo "Document Archive Management System"
echo "========================================"
echo ""

echo "Creating data directories..."
mkdir -p backend/data
mkdir -p backend/data/documents

echo ""
echo "Checking Docker environment..."
docker --version > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "ERROR: Docker is not installed or not in PATH."
    exit 1
fi

docker-compose --version > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "ERROR: Docker Compose is not installed or not in PATH."
    exit 1
fi

echo "Docker environment OK."

echo ""
echo "Building and starting containers with Docker Compose..."
docker-compose up -d --build

if [ $? -ne 0 ]; then
    echo "ERROR: Failed to start containers."
    exit 1
fi

echo ""
echo "========================================"
echo "System started successfully!"
echo "========================================"
echo ""
echo "Waiting for services to initialize..."
sleep 15

echo ""
echo "========================================"
echo "Service Information:"
echo "========================================"
echo ""
echo "Backend API:  http://localhost:8080/api"
echo "Frontend URL: http://localhost:3000"
echo ""
echo "Default accounts:"
echo "  - Admin: admin / admin123"
echo "  - User:  user / user123"
echo "  - Guest: guest / guest123"
echo ""
echo "To stop services: docker-compose down"
echo "To view logs:    docker-compose logs -f"
echo "========================================"
