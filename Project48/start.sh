#!/bin/bash
set -e

echo "========================================"
echo "IIoT Predictive Maintenance System"
echo "Startup Script"
echo "========================================"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"
cd "$SCRIPT_DIR"

echo "[Step 1/5] Checking environment..."
command -v go >/dev/null 2>&1 || { echo "ERROR: Go is not installed or not in PATH."; exit 1; }
command -v node >/dev/null 2>&1 || { echo "ERROR: Node.js is not installed or not in PATH."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "ERROR: npm is not installed or not in PATH."; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "ERROR: Python3 is not installed or not in PATH."; exit 1; }
echo "Environment check passed."
echo ""

echo "[Step 2/5] Creating data directories..."
mkdir -p data
mkdir -p data/influxdb
mkdir -p data/mosquitto
mkdir -p data/mosquitto/config
mkdir -p ai-service/data/models
echo "Data directories created."
echo ""

echo "[Step 3/5] Setting up backend..."
cd backend
echo "Downloading Go dependencies..."
go mod download
echo "Building backend..."
mkdir -p ../bin
go build -o ../bin/backend ./cmd
cd ..
echo "Backend setup completed."
echo ""

echo "[Step 4/5] Setting up frontend..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "node_modules exists, skipping install"
else
    echo "Installing npm dependencies..."
    npm install
fi
echo "Building frontend..."
npm run build
cd ..
echo "Frontend setup completed."
echo ""

echo "[Step 5/5] Setting up AI service..."
cd ai-service
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi
echo "Installing Python dependencies..."
source venv/bin/activate
pip install -r requirements.txt
deactivate
cd ..
echo "AI service setup completed."
echo ""

echo "========================================"
echo "Setup completed successfully!"
echo "========================================"
echo ""
echo "Starting services..."
echo ""

echo "Starting backend service on port 8080..."
cd backend
../bin/backend &
BACKEND_PID=$!
cd ..
sleep 3

echo "Starting AI prediction service on port 50051..."
cd ai-service
source venv/bin/activate
python main.py &
AI_PID=$!
cd ..
sleep 3

echo "Starting frontend development server on port 5173..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "========================================"
echo "All services started!"
echo "========================================"
echo ""
echo "Access URLs:"
echo "  - Frontend: http://localhost:5173"
echo "  - Backend API: http://localhost:8080"
echo "  - AI Service: http://localhost:50051"
echo ""
echo "Default login: admin / admin123"
echo ""
echo "Process IDs:"
echo "  - Backend: $BACKEND_PID"
echo "  - AI Service: $AI_PID"
echo "  - Frontend: $FRONTEND_PID"
echo ""
echo "Press Ctrl+C to stop all services..."

cleanup() {
    echo ""
    echo "Stopping all services..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $AI_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    echo "All services stopped."
    exit 0
}

trap cleanup INT TERM

wait
