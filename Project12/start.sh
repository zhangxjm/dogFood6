#!/bin/bash

echo "========================================"
echo "  Heritage 3D Platform - Start Script"
echo "========================================"
echo ""

echo "[1/4] Checking Python environment..."
if ! command -v python3 &> /dev/null; then
    echo "Error: Python3 is not installed or not in PATH"
    exit 1
fi
echo "Python OK"

echo ""
echo "[2/4] Checking Node.js environment..."
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed or not in PATH"
    exit 1
fi
echo "Node.js OK"

echo ""
echo "[3/4] Starting MinIO with Docker..."
if command -v docker &> /dev/null; then
    if ! docker ps -a --filter "name=heritage-minio" --format "{{.Names}}" | grep -q "heritage-minio"; then
        echo "Creating MinIO container..."
        docker run -d \
            --name heritage-minio \
            -p 9000:9000 \
            -p 9001:9001 \
            -e MINIO_ROOT_USER=minioadmin \
            -e MINIO_ROOT_PASSWORD=minioadmin \
            minio/minio:latest server /data --console-address ":9001"
    else
        echo "MinIO container exists, starting..."
        docker start heritage-minio
    fi
    echo "Waiting for MinIO to be ready..."
    sleep 5
else
    echo "Warning: Docker not found, skipping MinIO container"
    echo "Please ensure MinIO is running on port 9000"
fi

echo ""
echo "[4/4] Starting services..."

echo ""
echo "Starting backend server..."
cd backend
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
else
    source venv/bin/activate
fi
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
cd ..

echo ""
echo "Starting frontend server..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "========================================"
echo "  Services Started"
echo "========================================"
echo ""
echo "Backend API:     http://localhost:8000"
echo "API Docs:        http://localhost:8000/docs"
echo "Frontend:        http://localhost:3000"
echo "MinIO Console:   http://localhost:9001"
echo ""
echo "MinIO Credentials:"
echo "  Access Key: minioadmin"
echo "  Secret Key: minioadmin"
echo ""
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "Press Ctrl+C to stop all services"

trap "echo 'Stopping services...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; docker stop heritage-minio 2>/dev/null; exit" INT TERM

wait
