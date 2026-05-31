#!/bin/bash
echo "========================================"
echo "Pet Grooming System Startup Script"
echo "========================================"
echo ""

echo "Checking Docker status..."
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed or not in PATH. Please install Docker first."
    exit 1
fi
echo "Docker is available."
echo ""

echo "Stopping existing containers..."
docker-compose down
echo ""

echo "Building and starting all services..."
echo "This may take a few minutes for the first build..."
echo ""
docker-compose up -d --build
echo ""

echo "========================================"
echo "Services are starting..."
echo ""
echo "Please wait for the services to be fully ready."
echo ""
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:8080"
echo "Swagger UI: http://localhost:8080/swagger-ui.html"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop services: docker-compose down"
echo "========================================"
