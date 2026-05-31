#!/bin/bash

set -e

echo "========================================"
echo "  Heritage Digital Platform - Startup"
echo "========================================"
echo ""

echo "[1/6] Checking environment..."
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python is not installed. Please install Python 3.9+."
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed. Please install Node.js 18+."
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo "WARNING: Docker is not installed. Elasticsearch will not be available, using fallback search."
fi

echo ""
echo "[2/6] Copying environment file..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "Created .env file from .env.example"
fi

echo ""
echo "[3/6] Starting Docker services..."
if command -v docker &> /dev/null; then
    if docker ps &> /dev/null; then
        echo "Starting Elasticsearch container..."
        docker-compose up -d elasticsearch
        echo "Waiting for Elasticsearch to be ready..."
        sleep 20
    else
        echo "WARNING: Docker is not running. Skipping Elasticsearch."
    fi
fi

echo ""
echo "[4/6] Installing backend dependencies..."
cd backend
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate
pip install -r requirements.txt

echo ""
echo "[5/6] Initializing database..."
python3 -c "from app.init_data import init_database; init_database()"

echo ""
echo "[6/6] Starting backend server..."
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

echo ""
echo "Waiting for backend to start..."
sleep 10

echo ""
echo "Starting frontend..."
cd ../frontend

echo "Installing frontend dependencies..."
if [ ! -d "node_modules" ]; then
    npm install
fi

echo ""
echo "========================================"
echo "  Starting all services..."
echo "========================================"
echo ""
echo "Backend API:    http://localhost:8000"
echo "API Docs:       http://localhost:8000/docs"
echo "Frontend:       http://localhost:3005"
echo "Elasticsearch:  http://localhost:9200"
echo ""
echo "Demo Accounts:"
echo "  Admin:      admin / admin123"
echo "  Instructor: master_zhang / 123456"
echo "  User:       learner_wang / 123456"
echo ""
echo "Backend PID: $BACKEND_PID"
echo "Press Ctrl+C to stop."
echo "========================================"
echo ""

trap "kill $BACKEND_PID 2>/dev/null; exit" INT TERM

npm run dev

wait
