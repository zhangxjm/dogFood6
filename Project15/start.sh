#!/bin/bash

echo "============================================"
echo "  Silver Hair Health Monitoring Platform"
echo "  Starting Services..."
echo "============================================"
echo ""

echo "[1/3] Checking Docker..."
if command -v docker &> /dev/null; then
    echo "Starting MQTT Broker..."
    docker-compose up -d mqtt-broker
    echo "MQTT Broker started on port 1883"
else
    echo "Warning: Docker not found, skipping MQTT broker"
fi

echo ""
echo "[2/3] Starting Backend Service..."
cd backend
gnome-terminal --title="ElderCare Backend" -- bash -c "mvn spring-boot:run" 2>/dev/null || \
xterm -T "ElderCare Backend" -e "mvn spring-boot:run" 2>/dev/null || \
osascript -e 'tell application "Terminal" to do script "cd '$(pwd)' && mvn spring-boot:run"' 2>/dev/null
echo "Backend service is starting on port 8080..."
sleep 5

echo ""
echo "[3/3] Starting Frontend Service..."
cd ../frontend
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi
gnome-terminal --title="ElderCare Frontend" -- bash -c "npm run dev" 2>/dev/null || \
xterm -T "ElderCare Frontend" -e "npm run dev" 2>/dev/null || \
osascript -e 'tell application "Terminal" to do script "cd '$(pwd)' && npm run dev"' 2>/dev/null
echo "Frontend service is starting on port 3000..."

echo ""
echo "============================================"
echo "  All services started successfully!"
echo "============================================"
echo ""
echo "Backend API:  http://localhost:8080"
echo "Frontend UI:  http://localhost:3000"
echo "Swagger UI:   http://localhost:8080/swagger-ui.html"
echo ""
