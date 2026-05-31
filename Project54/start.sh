#!/bin/bash

echo "==========================================="
echo "Resume Template Management System"
echo "==========================================="
echo ""

echo "[INFO] Checking Python environment..."
if ! command -v python3 &> /dev/null; then
    echo "[ERROR] Python3 is not installed"
    exit 1
fi

echo "[INFO] Checking Node.js environment..."
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed"
    exit 1
fi

echo ""
echo "[1/6] Generating preview images..."
cd backend
python3 generate_previews.py
if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to generate preview images"
    exit 1
fi

echo ""
echo "[2/6] Initializing database and data..."
python3 init_data.py
if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to initialize data"
    exit 1
fi

echo ""
echo "[3/6] Installing backend dependencies..."
pip3 install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to install backend dependencies"
    exit 1
fi

echo ""
echo "[4/6] Installing frontend dependencies..."
cd ../frontend
npm install
if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to install frontend dependencies"
    exit 1
fi

echo ""
echo "[5/6] Building frontend..."
npm run build
if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to build frontend"
    exit 1
fi

echo ""
echo "[6/6] Starting services..."
cd ..

echo "[INFO] Starting backend server on port 8000..."
cd backend
nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload > backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

sleep 3

echo "[INFO] Starting frontend server on port 5173..."
cd ../frontend
nohup npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

echo ""
echo "==========================================="
echo "Services started successfully!"
echo "==========================================="
echo "Backend API: http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
echo "Frontend: http://localhost:5173"
echo "==========================================="
echo ""
echo "To stop services, run: ./stop.sh"
echo "Or kill PIDs: $BACKEND_PID $FRONTEND_PID"
