#!/bin/bash

echo "========================================"
echo "Nursery Management System - Docker Startup"
echo "========================================"

if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "Starting services with Docker Compose..."
docker-compose up -d --build

echo ""
echo "Services started successfully!"
echo "Server will be available at http://localhost:8080"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop: docker-compose down"
echo ""
