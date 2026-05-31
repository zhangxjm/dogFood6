#!/bin/bash

echo "========================================"
echo "Cross-Border Logistics System"
echo "========================================"
echo ""

echo "[1/5] Starting RabbitMQ container..."
docker-compose up -d rabbitmq
if [ $? -ne 0 ]; then
    echo "Failed to start RabbitMQ"
    exit 1
fi

echo "Waiting for RabbitMQ to be ready..."
sleep 15

echo ""
echo "[2/5] Initializing Go backend dependencies..."
cd backend
go mod tidy
if [ $? -ne 0 ]; then
    echo "Failed to download Go dependencies"
    exit 1
fi

echo ""
echo "[3/5] Starting Go backend server..."
gnome-terminal --title="Backend Server" -- bash -c "go run main.go; exec bash" &
cd ..

echo "Waiting for backend to start..."
sleep 10

echo ""
echo "[4/5] Initializing Vue frontend dependencies..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
    if [ $? -ne 0 ]; then
        echo "Failed to install frontend dependencies"
        exit 1
    fi
fi

echo ""
echo "[5/5] Starting Vue frontend server..."
gnome-terminal --title="Frontend Server" -- bash -c "npm run dev; exec bash" &
cd ..

echo ""
echo "========================================"
echo "System Startup Complete!"
echo "========================================"
echo "Backend API: http://localhost:8080"
echo "Frontend UI: http://localhost:3000"
echo "RabbitMQ Management: http://localhost:15672 (guest/guest)"
