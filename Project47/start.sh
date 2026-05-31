#!/bin/bash

echo "========================================"
echo "IPR Protection System - Startup Script"
echo "========================================"

echo ""
echo "[1/5] Checking Docker..."
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker not found. Please install Docker first."
    exit 1
fi
echo "OK: Docker is installed"

echo ""
echo "[2/5] Starting RabbitMQ container..."
docker-compose up -d rabbitmq
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to start RabbitMQ"
    exit 1
fi
echo "OK: RabbitMQ container started"

echo ""
echo "[3/5] Waiting for RabbitMQ to be ready..."
sleep 20

echo ""
echo "[4/5] Building and starting backend..."
cd backend
gnome-terminal -- bash -c "echo 'Backend starting...'; mvn spring-boot:run; exec bash" &
cd ..

echo ""
echo "[5/5] Starting frontend..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi
gnome-terminal -- bash -c "echo 'Frontend starting...'; npm run dev; exec bash" &
cd ..

echo ""
echo "========================================"
echo "Startup complete!"
echo "========================================"
echo ""
echo "Backend API: http://localhost:8080"
echo "Frontend UI: http://localhost:3008"
echo "RabbitMQ Management: http://localhost:15672 (admin/admin123)"
echo ""
echo "Please wait for services to fully start..."
