#!/bin/bash

echo "========================================"
echo "Pet Behavior AI Analysis System"
echo "========================================"
echo ""

echo "[1/6] Starting Docker services..."
cd "$(dirname "$0")/docker"
docker-compose up -d
if [ $? -ne 0 ]; then
    echo "Failed to start Docker services. Please ensure Docker is running."
    exit 1
fi
echo "Docker services started successfully."
echo ""

sleep 5

echo "[2/6] Installing Python dependencies..."
cd "$(dirname "$0")/backend"
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt
echo "Python dependencies installed."
echo ""

echo "[3/6] Running Django migrations..."
python manage.py migrate
echo "Migrations completed."
echo ""

echo "[4/6] Initializing default data..."
python manage.py init_data
echo "Data initialization completed."
echo ""

echo "[5/6] Installing frontend dependencies..."
cd "$(dirname "$0")/frontend"
if [ ! -d "node_modules" ]; then
    npm install
fi
echo "Frontend dependencies installed."
echo ""

echo "[6/6] Starting services..."
echo ""
echo "========================================"
echo "Services are starting:"
echo "- MinIO: http://localhost:9001"
echo "- Backend API: http://localhost:8000"
echo "- Frontend: http://localhost:3000"
echo "========================================"
echo ""

cd "$(dirname "$0")/backend"
source venv/bin/activate
python manage.py runserver 0.0.0.0:8000 &
DJANGO_PID=$!

sleep 3

cd "$(dirname "$0")/frontend"
npm run dev &
VUE_PID=$!

echo ""
echo "All services started!"
echo "Press Ctrl+C to stop all services..."

trap "kill $DJANGO_PID $VUE_PID; cd $(dirname "$0")/docker; docker-compose down; exit" INT TERM
wait
